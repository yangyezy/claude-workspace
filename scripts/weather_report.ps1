# 서울 강남구 논현동 날씨·미세먼지 정보를 받아와 weather.txt에 저장
# API 키 불필요: Open-Meteo (https://open-meteo.com) 무료 공개 API 사용

$ErrorActionPreference = "Stop"

$lat = 37.5104
$lon = 127.0359
$outFile = Join-Path $PSScriptRoot "..\weather.txt"
$envFile = Join-Path $PSScriptRoot "..\.env"

function Get-EnvValue($key) {
    if (-not (Test-Path $envFile)) { return $null }
    $line = Get-Content $envFile | Where-Object { $_ -match "^\s*$key\s*=" } | Select-Object -First 1
    if (-not $line) { return $null }
    $value = ($line -split "=", 2)[1].Trim()
    if ([string]::IsNullOrWhiteSpace($value)) { return $null }
    return $value
}

function Send-DiscordMessage($text) {
    $webhookUrl = Get-EnvValue "DISCORD_WEBHOOK_URL"
    if (-not $webhookUrl) {
        Write-Host "DISCORD_WEBHOOK_URL이 .env에 설정되어 있지 않아 Discord 전송을 건너뜁니다."
        return
    }
    try {
        $body = @{ content = $text } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json; charset=utf-8" -TimeoutSec 15 | Out-Null
        Write-Host "Discord 전송 완료"
    }
    catch {
        Write-Warning "Discord 전송 실패: $($_.Exception.Message)"
    }
}

$weatherCodeMap = @{
    0 = "맑음"; 1 = "대체로 맑음"; 2 = "부분적으로 흐림"; 3 = "흐림"
    45 = "안개"; 48 = "짙은 안개"
    51 = "약한 이슬비"; 53 = "이슬비"; 55 = "강한 이슬비"
    56 = "약한 착빙성 이슬비"; 57 = "강한 착빙성 이슬비"
    61 = "약한 비"; 63 = "비"; 65 = "강한 비"
    66 = "약한 착빙성 비"; 67 = "강한 착빙성 비"
    71 = "약한 눈"; 73 = "눈"; 75 = "강한 눈"; 77 = "싸락눈"
    80 = "약한 소나기"; 81 = "소나기"; 82 = "강한 소나기"
    85 = "약한 소낙눈"; 86 = "강한 소낙눈"
    95 = "뇌우"; 96 = "약한 우박 동반 뇌우"; 99 = "강한 우박 동반 뇌우"
}

function Get-Pm10Grade($v) {
    if ($v -le 30) { return "좋음" }
    elseif ($v -le 80) { return "보통" }
    elseif ($v -le 150) { return "나쁨" }
    else { return "매우 나쁨" }
}

function Get-Pm25Grade($v) {
    if ($v -le 15) { return "좋음" }
    elseif ($v -le 35) { return "보통" }
    elseif ($v -le 75) { return "나쁨" }
    else { return "매우 나쁨" }
}

try {
    $weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&timezone=Asia%2FSeoul"
    $airUrl = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=$lat&longitude=$lon&current=pm10,pm2_5,european_aqi,us_aqi&timezone=Asia%2FSeoul"

    $weather = Invoke-RestMethod -Uri $weatherUrl -TimeoutSec 15
    $air = Invoke-RestMethod -Uri $airUrl -TimeoutSec 15

    $wCode = [int]$weather.current.weather_code
    $wDesc = $weatherCodeMap[$wCode]
    if (-not $wDesc) { $wDesc = "코드 $wCode" }

    $pm10 = $air.current.pm10
    $pm25 = $air.current.pm2_5

    $lines = @(
        "서울 강남구 논현동 날씨 · 미세먼지 정보"
        "조회 시각: $(Get-Date -Format 'yyyy-MM-dd (ddd) HH:mm')"
        ""
        "[날씨]"
        ("  날씨 상태   : {0}" -f $wDesc)
        ("  기온        : {0}°C (체감 {1}°C)" -f $weather.current.temperature_2m, $weather.current.apparent_temperature)
        ("  습도        : {0}%" -f $weather.current.relative_humidity_2m)
        ("  풍속        : {0} km/h" -f $weather.current.wind_speed_10m)
        ""
        "[미세먼지]"
        ("  PM10        : {0} ug/m3 ({1})" -f $pm10, (Get-Pm10Grade $pm10))
        ("  PM2.5       : {0} ug/m3 ({1})" -f $pm25, (Get-Pm25Grade $pm25))
        ("  유럽 AQI    : {0}" -f $air.current.european_aqi)
        ("  미국 AQI    : {0}" -f $air.current.us_aqi)
        ""
        "출처: Open-Meteo (api.open-meteo.com, air-quality-api.open-meteo.com)"
    )

    $reportText = $lines -join "`r`n"
    $reportText | Set-Content -Path $outFile -Encoding utf8
    Write-Host "weather.txt 저장 완료: $outFile"

    Send-DiscordMessage "``````$reportText``````"
}
catch {
    $errLines = @(
        "날씨 정보 조회 실패"
        "조회 시각: $(Get-Date -Format 'yyyy-MM-dd (ddd) HH:mm')"
        "오류: $($_.Exception.Message)"
    )
    $errText = $errLines -join "`r`n"
    $errText | Set-Content -Path $outFile -Encoding utf8
    Send-DiscordMessage $errText
    Write-Error $_
    exit 1
}
