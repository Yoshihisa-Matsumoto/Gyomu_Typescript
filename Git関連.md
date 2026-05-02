# GitHubでマージ終わったら

1. git statusで未コミットないことの確認
2. git checkout main
3. git pull origin main

# Localの扶養ブランチ削除

1. git branch -d <不要ブランチ名>
2. git push origin --delete <不要ブランチ名>

## 一括で扶養ブランチ削除

- git branch --merged main | grep -v "main" | xargs git branch -d
