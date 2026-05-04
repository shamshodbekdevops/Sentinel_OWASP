Set-Location 'D:\SaaS\OWASP'

for ($i = 1; $i -le 42; $i++) {
    $d = (Get-Date).Date.AddDays(-$i).AddHours(12)
    $stamp = $d.ToString('yyyy-MM-ddTHH:mm:ss')

    $env:GIT_AUTHOR_DATE = $stamp
    $env:GIT_COMMITTER_DATE = $stamp

    git commit --allow-empty -m "chore: contribution activity $i" | Out-Null
}

Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

git rev-list --count HEAD
