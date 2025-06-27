#!/bin/bash

# 数字のみの乱数生成ツール
# 使用方法: ./_rand.sh [桁数] [オプション]

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# デフォルト値
DEFAULT_DIGITS=6
DEFAULT_COUNT=1
ALLOW_LEADING_ZERO=true

# 引数解析
DIGITS=""
COUNT=$DEFAULT_COUNT

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            echo -e "${BLUE}数字のみ乱数生成ツール${NC}"
            echo "使用方法: $0 [桁数] [オプション]"
            echo ""
            echo "引数:"
            echo "  桁数              生成する数字の桁数 (デフォルト: $DEFAULT_DIGITS)"
            echo ""
            echo "オプション:"
            echo "  -c, --count NUM   生成する乱数の個数 (デフォルト: 1)"
            echo "  --no-leading-zero 先頭の0を許可しない"
            echo "  -h, --help        このヘルプを表示"
            echo ""
            echo "例:"
            echo "  $0                      # 6桁の数字乱数を1個生成"
            echo "  $0 4                    # 4桁の数字乱数を1個生成"
            echo "  $0 8 -c 3               # 8桁の数字乱数を3個生成"
            echo "  $0 6 --no-leading-zero  # 先頭0なしの6桁数字を生成"
            echo ""
            echo "出力例:"
            echo "  4桁: 1234, 0567, 9876"
            echo "  6桁: 123456, 098765, 543210"
            echo "  先頭0なし: 123456, 987654 (012345 → 123456)"
            exit 0
            ;;
        -c|--count)
            COUNT="$2"
            shift 2
            ;;
        --no-leading-zero)
            ALLOW_LEADING_ZERO=false
            shift
            ;;
        -*|--*)
            echo "エラー: 不明なオプション $1"
            echo "使用方法については $0 --help を参照してください"
            exit 1
            ;;
        *)
            if [[ -z "$DIGITS" ]]; then
                DIGITS="$1"
            else
                echo "エラー: 余分な引数 $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# デフォルト値設定
DIGITS=${DIGITS:-$DEFAULT_DIGITS}

# 入力値検証
if ! [[ "$DIGITS" =~ ^[0-9]+$ ]] || [ "$DIGITS" -le 0 ]; then
    echo "エラー: 桁数は正の整数である必要があります"
    exit 1
fi

if [ "$DIGITS" -gt 15 ]; then
    echo "エラー: 桁数は15桁以下にしてください（処理性能の制限）"
    exit 1
fi

if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || [ "$COUNT" -le 0 ]; then
    echo "エラー: 個数は正の整数である必要があります"
    exit 1
fi

# 設定の表示
echo -e "${YELLOW}数字乱数生成設定:${NC}"
echo "桁数: $DIGITS"
echo "個数: $COUNT"
if [ "$ALLOW_LEADING_ZERO" = true ]; then
    echo "先頭0: 許可"
else
    echo "先頭0: 禁止"
fi
echo ""

# 数字乱数生成関数
generate_number() {
    local digits=$1
    local number=""
    
    for ((i=0; i<digits; i++)); do
        if [ $i -eq 0 ] && [ "$ALLOW_LEADING_ZERO" = false ]; then
            # 最初の桁は1-9
            local digit=$((1 + RANDOM % 9))
        else
            # 0-9
            local digit=$((RANDOM % 10))
        fi
        number+="$digit"
    done
    
    echo "$number"
}

# 乱数生成と出力
for ((i=1; i<=COUNT; i++)); do
    number=$(generate_number "$DIGITS")
    printf "${GREEN}%s${NC}\n" "$number"
done

echo ""
echo -e "${BLUE}生成完了!${NC}"

# 使用例の表示（1個の場合のみ）
if [ "$COUNT" -eq 1 ]; then
    echo ""
    echo -e "${YELLOW}使用例:${NC}"
    case $DIGITS in
        4)
            echo "PIN番号: $number"
            echo "認証コード: $number"
            ;;
        6)
            echo "認証コード: $number"
            echo "一時パスワード: $number"
            ;;
        8)
            echo "ID番号: $number"
            echo "会員番号: $number"
            ;;
        *)
            echo "数値ID: $number"
            ;;
    esac
fi
