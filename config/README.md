## config.sample.toml

服务器配置文件样例

## priv.bin

license签发私钥，本仓库仅供测试使用，正式环境请使用 `r2s-license` 重新生成；

## pub.bin

license验证公钥，本仓库仅供测试使用，正式环境请使用 `r2s-license` 重新生成并重新编译分发二进制；

```sh
# Generate new CA
cargo run --bin r2s-license -- init -p config/
# Sign new license
cargo run --bin r2s-license -- new --ca ./config/priv.bin --path ./config/ --issuer 组织名 --website 域名 --level enterprise --date 2077-01-01
```

## sensitive_word_list.txt

敏感词检测词库
