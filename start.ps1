# FLLanding Docker Management Script
# Usage: .\start.ps1 [start|stop|restart|status|build|logs]

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'build', 'logs')]
    [string]$Action = 'start',
    
    [int]$Port = 8080,
    [string]$ImageName = 'fllanding:latest',
    [string]$ContainerName = 'fllanding'
)

function Write-ColorOutput {
    param(
        [ConsoleColor]$ForegroundColor,
        [string]$Message
    )
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

function Test-DockerRunning {
    try {
        $null = docker info 2>&1 | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Get-ContainerStatus {
    $result = docker ps -a --filter "name=$ContainerName" --format '{{.Names}}|{{.Status}}' 2>&1
    if ($LASTEXITCODE -eq 0 -and $result -and $result.ToString().Trim()) {
        return $result.ToString().Trim()
    }
    return $null
}

function Build-Image {
    Write-ColorOutput -ForegroundColor Cyan "Building Docker image '$ImageName'..."
    docker build -t $ImageName .
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput -ForegroundColor Green "Image built successfully!"
        return $true
    } else {
        Write-ColorOutput -ForegroundColor Red "Error building image"
        return $false
    }
}

function Start-Container {
    $status = Get-ContainerStatus
    if ($status -and $status -match 'Up') {
        Write-ColorOutput -ForegroundColor Yellow "Container '$ContainerName' is already running"
        return
    }
    
    if ($status -and $status -match 'Exited') {
        Write-ColorOutput -ForegroundColor Cyan "Starting existing container..."
        docker start $ContainerName | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput -ForegroundColor Green "Container started!"
            Write-ColorOutput -ForegroundColor Cyan "Site available at: http://localhost:$Port"
        }
        return
    }
    
    Write-ColorOutput -ForegroundColor Cyan "Starting new container '$ContainerName' on port $Port..."
    
    $imageList = docker images --format '{{.Repository}}:{{.Tag}}' 2>&1
    $imageExists = $imageList | Select-String -Pattern "^$([regex]::Escape($ImageName))$"
    if (-not $imageExists) {
        Write-ColorOutput -ForegroundColor Yellow "Image '$ImageName' not found. Building..."
        if (-not (Build-Image)) {
            return
        }
    }
    
    try {
        $portInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($portInUse) {
            Write-ColorOutput -ForegroundColor Red "Port $Port is already in use. Use another port or stop container: .\start.ps1 stop"
            return
        }
    } catch {
    }
    
    $runResult = docker run -d --name $ContainerName -p "${Port}:80" --restart unless-stopped $ImageName 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Start-Sleep -Seconds 2
        Write-ColorOutput -ForegroundColor Green "Container started successfully!"
        Write-ColorOutput -ForegroundColor Cyan "Site available at: http://localhost:$Port"
        Write-ColorOutput -ForegroundColor Gray "View logs: .\start.ps1 logs"
        Write-ColorOutput -ForegroundColor Gray "Stop: .\start.ps1 stop"
    } else {
        Write-ColorOutput -ForegroundColor Red "Error starting container: $runResult"
    }
}

function Stop-Container {
    $status = Get-ContainerStatus
    if (-not $status) {
        Write-ColorOutput -ForegroundColor Yellow "Container '$ContainerName' not found"
        return
    }
    
    if ($status -match 'Exited') {
        Write-ColorOutput -ForegroundColor Yellow "Container '$ContainerName' is already stopped"
        return
    }
    
    Write-ColorOutput -ForegroundColor Cyan "Stopping container '$ContainerName'..."
    docker stop $ContainerName | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput -ForegroundColor Green "Container stopped"
        
        $remove = Read-Host "Remove container? (y/N)"
        if ($remove -eq 'y' -or $remove -eq 'Y') {
            docker rm $ContainerName | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput -ForegroundColor Green "Container removed"
            }
        }
    } else {
        Write-ColorOutput -ForegroundColor Red "Error stopping container"
    }
}

function Show-Status {
    Write-ColorOutput -ForegroundColor Cyan "Container status '$ContainerName':"
    Write-Output ""
    
    $status = Get-ContainerStatus
    if ($status) {
        $parts = $status.ToString() -split '\|'
        if ($parts.Length -ge 2) {
            $name = $parts[0]
            $statusText = $parts[1]
            Write-Output "Name: $name"
            Write-Output "Status: $statusText"
        }
        Write-Output ""
        
        docker ps --filter "name=$ContainerName" --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}" 2>&1
    } else {
        Write-ColorOutput -ForegroundColor Yellow "Container not found"
    }
    
    Write-Output ""
    Write-ColorOutput -ForegroundColor Cyan "Available commands:"
    Write-Output "  .\start.ps1 start   - start container"
    Write-Output "  .\start.ps1 stop    - stop container"
    Write-Output "  .\start.ps1 restart - restart container"
    Write-Output "  .\start.ps1 status  - show status"
    Write-Output "  .\start.ps1 build   - build image"
    Write-Output "  .\start.ps1 logs    - show logs"
}

function Show-Logs {
    $status = Get-ContainerStatus
    if (-not $status -or $status -match 'Exited') {
        Write-ColorOutput -ForegroundColor Yellow "Container '$ContainerName' is not running"
        return
    }
    
    Write-ColorOutput -ForegroundColor Cyan "Container logs '$ContainerName' (Ctrl+C to exit):"
    Write-Output ""
    docker logs -f $ContainerName
}

function Restart-Container {
    Write-ColorOutput -ForegroundColor Cyan "Restarting container..."
    Stop-Container
    Start-Sleep -Seconds 1
    Start-Container
}

function Wait-ForInterrupt {
    param(
        [switch]$StopContainerOnExit
    )
    
    Write-Output ""
    if ($StopContainerOnExit) {
        Write-ColorOutput -ForegroundColor Gray "Container is running. Press Ctrl+C to stop container and exit..."
    } else {
        Write-ColorOutput -ForegroundColor Gray "Press Ctrl+C to exit..."
    }
    
    # Wait loop - Ctrl+C will trigger trap set in calling code
    while ($true) {
        Start-Sleep -Seconds 1
    }
}

# Global flag to track if we should stop container on exit
$script:StopContainerOnExit = $false
$script:ContainerNameToStop = $null

# Function to stop container if needed
function Stop-ContainerOnExit {
    if ($script:StopContainerOnExit -and $script:ContainerNameToStop) {
        try {
            # Check if container is running
            $result = docker ps --filter "name=$($script:ContainerNameToStop)" --format "{{.Names}}" 2>&1
            $isRunning = $result -and $result.ToString().Trim() -eq $script:ContainerNameToStop
            
            if ($isRunning) {
                Write-Output ""
                Write-ColorOutput -ForegroundColor Yellow "Stopping container '$($script:ContainerNameToStop)'..."
                # Force stop container
                docker stop $script:ContainerNameToStop 2>&1 | Out-Null
                Start-Sleep -Milliseconds 500
                Write-ColorOutput -ForegroundColor Green "Container stopped"
            }
        } catch {
            # Ignore errors in cleanup
        }
    }
}

# Register handler for PowerShell exit - this should catch Ctrl+C too
$exitJob = Register-EngineEvent PowerShell.Exiting -Action {
    Stop-ContainerOnExit
} -SupportEvent

# Also register for process exit as backup
$processExitJob = Register-ObjectEvent -InputObject ([System.AppDomain]::CurrentDomain) -EventName "ProcessExit" -Action {
    Stop-ContainerOnExit
} -SupportEvent

Write-ColorOutput -ForegroundColor Cyan "========================================"
Write-ColorOutput -ForegroundColor Cyan "   FLLanding Docker Management Script"
Write-ColorOutput -ForegroundColor Cyan "========================================"
Write-Output ""

if (-not (Test-DockerRunning)) {
    Write-ColorOutput -ForegroundColor Red "Docker is not running or not available"
    Write-ColorOutput -ForegroundColor Yellow "Make sure Docker Desktop is running"
    exit 1
}

try {
    switch ($Action) {
        'build' {
            Build-Image
            Wait-ForInterrupt
        }
        'start' {
            $containerStarted = $false
            $status = Get-ContainerStatus
            if ($status -and $status -match 'Up') {
                $containerStarted = $true
            } else {
                Start-Container
                $status = Get-ContainerStatus
                if ($status -and $status -match 'Up') {
                    $containerStarted = $true
                }
            }
            
            if ($containerStarted) {
                $script:StopContainerOnExit = $true
                $script:ContainerNameToStop = $ContainerName
                
                # Setup trap to catch Ctrl+C and stop container
                trap {
                    Write-Output ""
                    Write-ColorOutput -ForegroundColor Yellow "Stopping container '$ContainerName'..."
                    docker stop $ContainerName 2>&1 | Out-Null
                    Write-ColorOutput -ForegroundColor Green "Container stopped"
                    Write-ColorOutput -ForegroundColor Yellow "Exiting..."
                    exit 0
                }
                
                Wait-ForInterrupt -StopContainerOnExit
            }
        }
        'stop' {
            Stop-Container
            Wait-ForInterrupt
        }
        'restart' {
            Restart-Container
            $script:StopContainerOnExit = $true
            $script:ContainerNameToStop = $ContainerName
            
            # Setup trap to catch Ctrl+C and stop container
            trap {
                Write-Output ""
                Write-ColorOutput -ForegroundColor Yellow "Stopping container '$ContainerName'..."
                docker stop $ContainerName 2>&1 | Out-Null
                Write-ColorOutput -ForegroundColor Green "Container stopped"
                Write-ColorOutput -ForegroundColor Yellow "Exiting..."
                exit 0
            }
            
            Wait-ForInterrupt -StopContainerOnExit
        }
        'status' {
            Show-Status
            Wait-ForInterrupt
        }
        'logs' {
            Show-Logs
        }
    }
} finally {
    # Backup mechanism: stop container if flag is set (in case trap didn't fire)
    if ($script:StopContainerOnExit -and $script:ContainerNameToStop) {
        $status = docker ps --filter "name=$($script:ContainerNameToStop)" --format "{{.Names}}" 2>&1
        if ($status -and $status.ToString().Trim() -eq $script:ContainerNameToStop) {
            Write-Output ""
            Write-ColorOutput -ForegroundColor Yellow "Stopping container '$($script:ContainerNameToStop)'..."
            docker stop $script:ContainerNameToStop 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput -ForegroundColor Green "Container stopped"
            }
        }
    }
}
