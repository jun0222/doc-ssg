#!/bin/bash

# UUID生成ツール
# 使用方法: ./_uuid-gen.sh [オプション]

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# デフォルト値
DEFAULT_COUNT=1
DEFAULT_VERSION=4
UPPERCASE=false
NO_HYPHENS=false
COMPACT=false

# 引数解析
COUNT=$DEFAULT_COUNT
VERSION=$DEFAULT_VERSION

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            echo -e "${BLUE}UUID生成ツール${NC}"
            echo "使用方法: $0 [オプション]"
            echo ""
            echo "オプション:"
            echo "  -c, --count NUM     生成するUUIDの個数 (デフォルト: 1)"
            echo "  -v, --version VER   UUIDバージョン (4のみサポート、デフォルト: 4)"
            echo "  -u, --uppercase     大文字で出力"
            echo "  -n, --no-hyphens    ハイフンなしで出力"
            echo "  --compact           コンパクト形式で出力（ハイフンなし、改行なし）"
            echo "  -f, --format FMT    出力フォーマット指定"
            echo "                      std: 標準形式 (デフォルト)"
            echo "                      upper: 大文字"
            echo "                      nohyp: ハイフンなし"
            echo "                      compact: コンパクト"
            echo "  -h, --help          このヘルプを表示"
            echo ""
            echo "例:"
            echo "  $0                      # 標準的なUUIDを1個生成"
            echo "  $0 -c 5                 # UUIDを5個生成"
            echo "  $0 -u                   # 大文字のUUIDを生成"
            echo "  $0 -n                   # ハイフンなしのUUIDを生成"
            echo "  $0 --compact            # コンパクト形式で生成"
            echo "  $0 -c 3 -u              # 大文字のUUIDを3個生成"
            echo ""
            echo "UUID形式例:"
            echo "  標準:      550e8400-e29b-41d4-a716-446655440000"
            echo "  大文字:    550E8400-E29B-41D4-A716-446655440000"
            echo "  ハイフンなし: 550e8400e29b41d4a716446655440000"
            echo "  コンパクト: 550e8400e29b41d4a716446655440000"
            exit 0
            ;;
        -c|--count)
            COUNT="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -u|--uppercase)
            UPPERCASE=true
            shift
            ;;
        -n|--no-hyphens)
            NO_HYPHENS=true
            shift
            ;;
        --compact)
            COMPACT=true
            NO_HYPHENS=true
            shift
            ;;
        -f|--format)
            case "$2" in
                std|standard)
                    # デフォルト設定のまま
                    ;;
                upper|uppercase)
                    UPPERCASE=true
                    ;;
                nohyp|no-hyphens)
                    NO_HYPHENS=true
                    ;;
                compact)
                    COMPACT=true
                    NO_HYPHENS=true
                    ;;
                *)
                    echo "エラー: 不明なフォーマット $2"
                    echo "サポートされているフォーマット: std, upper, nohyp, compact"
                    exit 1
                    ;;
            esac
            shift 2
            ;;
        -*|--*)
            echo "エラー: 不明なオプション $1"
            echo "使用方法については $0 --help を参照してください"
            exit 1
            ;;
        *)
            echo "エラー: 余分な引数 $1"
            echo "使用方法については $0 --help を参照してください"
            exit 1
            ;;
    esac
done

# 入力値検証
if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || [ "$COUNT" -le 0 ]; then
    echo "エラー: 個数は正の整数である必要があります"
    exit 1
fi

if [ "$VERSION" != "4" ]; then
    echo "エラー: 現在はUUIDバージョン4のみサポートしています"
    exit 1
fi

# uuidgenコマンドの存在確認
if ! command -v uuidgen &> /dev/null; then
    echo "エラー: uuidgenコマンドが見つかりません"
    echo "macOSでは標準で利用可能です。Linuxの場合は uuid-runtime パッケージをインストールしてください"
    exit 1
fi

# 設定の表示
echo -e "${YELLOW}UUID生成設定:${NC}"
echo "個数: $COUNT"
echo "バージョン: $VERSION"
echo -n "フォーマット: "
if [ "$UPPERCASE" = true ]; then
    echo -n "大文字 "
fi
if [ "$NO_HYPHENS" = true ]; then
    echo -n "ハイフンなし "
fi
if [ "$COMPACT" = true ]; then
    echo -n "コンパクト "
fi
if [ "$UPPERCASE" = false ] && [ "$NO_HYPHENS" = false ]; then
    echo -n "標準 "
fi
echo ""
echo ""

# UUID生成関数
generate_uuid() {
    local uuid
    uuid=$(uuidgen)
    
    # ハイフン除去
    if [ "$NO_HYPHENS" = true ]; then
        uuid=$(echo "$uuid" | tr -d '-')
    fi
    
    # 大文字変換
    if [ "$UPPERCASE" = true ]; then
        uuid=$(echo "$uuid" | tr '[:lower:]' '[:upper:]')
    else
        uuid=$(echo "$uuid" | tr '[:upper:]' '[:lower:]')
    fi
    
    echo "$uuid"
}

# UUID生成と出力
if [ "$COMPACT" = true ]; then
    # コンパクト形式（改行なし、スペース区切り）
    for ((i=1; i<=COUNT; i++)); do
        uuid=$(generate_uuid)
        if [ $i -eq 1 ]; then
            printf "${GREEN}%s${NC}" "$uuid"
        else
            printf " ${GREEN}%s${NC}" "$uuid"
        fi
    done
    echo ""
else
    # 通常形式（各UUIDを改行区切り）
    for ((i=1; i<=COUNT; i++)); do
        uuid=$(generate_uuid)
        printf "${GREEN}%s${NC}\n" "$uuid"
    done
fi

echo ""
echo -e "${BLUE}生成完了!${NC}"

# 使用例の表示（1個の場合のみ）
if [ "$COUNT" -eq 1 ] && [ "$COMPACT" = false ]; then
    echo ""
    echo -e "${CYAN}使用例:${NC}"
    echo "JavaScript: const id = '$uuid';"
    echo "Python:     id = '$uuid'"
    echo "SQL:        INSERT INTO table (id) VALUES ('$uuid');"
fi
