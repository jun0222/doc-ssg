#!/bin/bash

# パスワード生成ツール
# 使用方法: ./_rand.sh [オプション] [桁数]

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 文字セット定義
LOWERCASE="abcdefghijklmnopqrstuvwxyz"
UPPERCASE="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
NUMBERS="0123456789"
SYMBOLS="!@#$%^&*()_+-=[]{}|;:,.<>?"

# デフォルト値
DEFAULT_LENGTH=12
USE_LOWERCASE=true
USE_UPPERCASE=true
USE_NUMBERS=true
USE_SYMBOLS=false

# 引数解析
LENGTH=""
COUNT=1

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            echo -e "${BLUE}パスワード生成ツール${NC}"
            echo "使用方法: $0 [オプション] [桁数]"
            echo ""
            echo "オプション:"
            echo "  -l, --lowercase    小文字英字を含める (デフォルト: 有効)"
            echo "  -u, --uppercase    大文字英字を含める (デフォルト: 有効)"
            echo "  -n, --numbers      数字を含める (デフォルト: 有効)"
            echo "  -s, --symbols      記号を含める (デフォルト: 無効)"
            echo "  -c, --count NUM    生成するパスワードの個数 (デフォルト: 1)"
            echo "  --no-lowercase     小文字英字を除外"
            echo "  --no-uppercase     大文字英字を除外"
            echo "  --no-numbers       数字を除外"
            echo "  --no-symbols       記号を除外"
            echo "  -h, --help         このヘルプを表示"
            echo ""
            echo "例:"
            echo "  $0                      # 12桁のパスワード(小文字+大文字+数字)"
            echo "  $0 16                   # 16桁のパスワード"
            echo "  $0 -s 20                # 20桁のパスワード(記号含む)"
            echo "  $0 --no-uppercase 8     # 8桁のパスワード(大文字なし)"
            echo "  $0 -c 5 10              # 10桁のパスワードを5個生成"
            exit 0
            ;;
        -l|--lowercase)
            USE_LOWERCASE=true
            shift
            ;;
        -u|--uppercase)
            USE_UPPERCASE=true
            shift
            ;;
        -n|--numbers)
            USE_NUMBERS=true
            shift
            ;;
        -s|--symbols)
            USE_SYMBOLS=true
            shift
            ;;
        --no-lowercase)
            USE_LOWERCASE=false
            shift
            ;;
        --no-uppercase)
            USE_UPPERCASE=false
            shift
            ;;
        --no-numbers)
            USE_NUMBERS=false
            shift
            ;;
        --no-symbols)
            USE_SYMBOLS=false
            shift
            ;;
        -c|--count)
            COUNT="$2"
            shift 2
            ;;
        -*|--*)
            echo "エラー: 不明なオプション $1"
            echo "使用方法については $0 --help を参照してください"
            exit 1
            ;;
        *)
            if [[ -z "$LENGTH" ]]; then
                LENGTH="$1"
            else
                echo "エラー: 余分な引数 $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# デフォルト値設定
LENGTH=${LENGTH:-$DEFAULT_LENGTH}

# 入力値検証
if ! [[ "$LENGTH" =~ ^[0-9]+$ ]] || [ "$LENGTH" -le 0 ]; then
    echo "エラー: 桁数は正の整数である必要があります"
    exit 1
fi

if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || [ "$COUNT" -le 0 ]; then
    echo "エラー: 個数は正の整数である必要があります"
    exit 1
fi

# 文字セット構築
CHARSET=""
if [ "$USE_LOWERCASE" = true ]; then
    CHARSET+="$LOWERCASE"
fi
if [ "$USE_UPPERCASE" = true ]; then
    CHARSET+="$UPPERCASE"
fi
if [ "$USE_NUMBERS" = true ]; then
    CHARSET+="$NUMBERS"
fi
if [ "$USE_SYMBOLS" = true ]; then
    CHARSET+="$SYMBOLS"
fi

# 文字セットが空でないかチェック
if [ -z "$CHARSET" ]; then
    echo "エラー: 少なくとも1つの文字タイプを選択してください"
    exit 1
fi

# 使用する文字セットの表示
echo -e "${YELLOW}パスワード生成設定:${NC}"
echo "桁数: $LENGTH"
echo "個数: $COUNT"
echo -n "使用文字: "
[ "$USE_LOWERCASE" = true ] && echo -n "小文字英字 "
[ "$USE_UPPERCASE" = true ] && echo -n "大文字英字 "
[ "$USE_NUMBERS" = true ] && echo -n "数字 "
[ "$USE_SYMBOLS" = true ] && echo -n "記号 "
echo ""
echo ""

# パスワード生成
for ((i=1; i<=COUNT; i++)); do
    password=""
    for ((j=0; j<LENGTH; j++)); do
        # ランダムに文字を選択
        random_index=$((RANDOM % ${#CHARSET}))
        password+="${CHARSET:$random_index:1}"
    done
    
    # 緑色で出力
    printf "${GREEN}%s${NC}\n" "$password"
done

echo ""
echo -e "${BLUE}生成完了!${NC}"
