const fetch = require("node-fetch");

exports.handler = async function (event, context) {
    // OPTIONS 요청 처리 (CORS preflight)
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://dmu-pay.netlify.app",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: "",
        };
    }

    // POST 요청 처리 (결제 생성)
    if (event.httpMethod === "POST") {
        try {
            // signup.js와 동일한 JSON 파싱 방식
            const body = JSON.parse(event.body);

            // PHP 서버로 프록시 요청 전송
            const response = await fetch("http://dmupay01.dothome.co.kr/payment.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const result = await response.text();

            return {
                statusCode: 200,
                body: result,
                headers: {
                    "Content-Type": "application/json",
                },
            };
        } catch (err) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    success: false,
                    message: "서버 오류: " + err.message
                }),
            };
        }
    }

    // GET 요청 처리 (결제 내역 조회)
    else if (event.httpMethod === "GET") {
        try {
            // URL 파라미터 가져오기
            const merchant_code = event.queryStringParameters?.merchant_code || '';

            const response = await fetch(
                `http://dmupay01.dothome.co.kr/payment.php?merchant_code=${merchant_code}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const result = await response.text();

            return {
                statusCode: 200,
                body: result,
                headers: {
                    "Content-Type": "application/json",
                },
            };
        } catch (err) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    success: false,
                    message: "서버 오류: " + err.message
                }),
            };
        }
    }

    // 지원하지 않는 메서드
    return {
        statusCode: 405,
        body: JSON.stringify({ message: "허용되지 않은 메서드입니다." }),
    };
};
