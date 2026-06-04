-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- 생성 시간: 25-11-03 15:43
-- 서버 버전: 10.4.32-MariaDB
-- PHP 버전: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 데이터베이스: `dmu_pay`
--

DELIMITER $$
--
-- 함수
--
CREATE DEFINER=`root`@`localhost` FUNCTION `calculate_business_date` (`input_datetime` TIMESTAMP) RETURNS DATE DETERMINISTIC BEGIN
    DECLARE business_date DATE;
    
    -- 오전 5시 기준으로 영업일 계산
    IF HOUR(input_datetime) < 5 THEN
        SET business_date = DATE_SUB(DATE(input_datetime), INTERVAL 1 DAY);
    ELSE
        SET business_date = DATE(input_datetime);
    END IF;
    
    RETURN business_date;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- 테이블 구조 `dongyang`
--

CREATE TABLE `dongyang` (
  `student_no` varchar(20) NOT NULL,
  `id` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL,
  `major` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 테이블의 덤프 데이터 `dongyang`
--

INSERT INTO `dongyang` (`student_no`, `id`, `password`, `name`, `major`) VALUES
('20230001', '', '', '홍길동', '컴퓨터정보공학과'),
('20230002', '', '', '박수민', '경영학과'),
('20230003', '', '', '전상윤', '전기전자공학과'),
('20230004', '', '', '서동현', '정보통신과'),
('20230005', '', '', '신민재', '기계공학과'),
('20230006', '', '', '이승현', '건축과'),
('20230007', '', '', '최강민', '컴퓨터정보공학과'),
('20230008', '', '', '김지연', '정보통신과'),
('20230009', '', '', '이수진', '경영학과'),
('20230010', '', '', '정혜린', '전기전자공학과'),
('20230011', '', '', '김김김', '정보통신과');

-- --------------------------------------------------------

--
-- 테이블 구조 `merchants`
--

CREATE TABLE `merchants` (
  `m_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `store_name` varchar(50) NOT NULL,
  `merchant_code` varchar(30) NOT NULL,
  `reg_date` datetime NOT NULL DEFAULT current_timestamp(),
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `account_holder` varchar(100) DEFAULT NULL,
  `bank_name` varchar(30) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `business_no` varchar(50) DEFAULT NULL,
  `category` varchar(30) NOT NULL DEFAULT '기타'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 테이블의 덤프 데이터 `merchants`
--

INSERT INTO `merchants` (`m_id`, `user_id`, `store_name`, `merchant_code`, `reg_date`, `phone`, `address`, `account_holder`, `bank_name`, `account_number`, `business_no`, `category`) VALUES
(9, 108, '역전우동', '1', '2025-09-07 17:00:12', '010-1111-1111', '학교옆', '김우동', '1', '1', '1', '음식점'),
(10, 109, '상점2', '2', '2025-09-07 17:00:59', '010-2222-2222', '22', '2', '2', '2', '2', '상점'),
(12, 113, '기타3', '3', '2025-09-08 18:01:35', '010-3333-3333', '3', '3', '3', '3', '3', '기타'),
(13, 114, '음식점4', '4', '2025-09-15 17:44:33', '010-4444-4444', '4', '4', '4', '4', '4', '음식점'),
(14, 115, '상점5', '5', '2025-09-15 17:45:18', '010-5555-5555', '5', '5', '5', '5', '5', '상점');

-- --------------------------------------------------------

--
-- 테이블 구조 `merchants_payments`
--

CREATE TABLE `merchants_payments` (
  `payment_id` int(10) UNSIGNED NOT NULL,
  `merchant_code` varchar(20) NOT NULL,
  `store_name` varchar(50) NOT NULL,
  `cost` int(11) NOT NULL,
  `customer_name` varchar(50) NOT NULL,
  `txn_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_cancelled` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 테이블의 덤프 데이터 `merchants_payments`
--

INSERT INTO `merchants_payments` (`payment_id`, `merchant_code`, `store_name`, `cost`, `customer_name`, `txn_at`, `is_cancelled`) VALUES
(16, '1', '1', 300, '홍길동', '2025-09-07 08:26:33', 0),
(17, '2', '2', 400, '홍길동', '2025-09-07 08:26:40', 0),
(19, '1', '1', 100, '홍길동', '2025-09-08 06:07:51', 0),
(20, '1', '1', 100, '홍길동', '2025-09-08 06:08:15', 0),
(21, '1', '음식1', 100, '홍길동', '2025-09-08 08:35:40', 0),
(22, '1', '음식1', 100, '홍길동', '2025-09-08 08:49:48', 0),
(23, '1', '음식1', 100, '홍길동', '2025-09-08 08:58:04', 0),
(24, '1', '음식1', 100, '홍길동', '2025-09-08 08:58:42', 0),
(25, '1', '음식1', 100, '홍길동', '2025-09-08 09:00:27', 0),
(26, '1', '음식1', 100, '홍길동', '2025-09-08 16:34:18', 0),
(27, '1', '음식1', 100, '홍길동', '2025-09-15 08:30:06', 0),
(28, '1', '음식1', 100, '홍길동', '2025-09-15 08:30:14', 0),
(29, '1', '음식1', 100, '홍길동', '2025-09-15 08:30:29', 0),
(30, '1', '역전우동', 300, '홍길동', '2025-10-11 17:01:28', 1),
(31, '1', '역전우동', 100, '홍길동', '2025-10-11 17:25:25', 0),
(32, '2', '상점2', 400, '홍길동', '2025-10-11 17:41:38', 0),
(33, '2', '상점2', 100, '홍길동', '2025-10-11 17:46:05', 0),
(34, '1', '역전우동', 100, '홍길동', '2025-11-03 14:31:18', 0);

--
-- 트리거 `merchants_payments`
--
DELIMITER $$
CREATE TRIGGER `trg_payment_after_insert` AFTER INSERT ON `merchants_payments` FOR EACH ROW BEGIN
    DECLARE biz_date DATE;
    
    -- 영업일 계산
    SET biz_date = calculate_business_date(NEW.txn_at);
    
    -- 취소되지 않은 정상 거래인 경우
    IF NEW.is_cancelled = FALSE THEN
        INSERT INTO merchant_sales (
            merchant_code, 
            sales_date, 
            daily_sales, 
            order_cnt
        ) VALUES (
            NEW.merchant_code,
            biz_date,
            NEW.cost,
            1
        ) ON DUPLICATE KEY UPDATE
            daily_sales = daily_sales + NEW.cost,
            order_cnt = order_cnt + 1;
    ELSE
        -- 취소된 거래인 경우
        INSERT INTO merchant_sales (
            merchant_code, 
            sales_date, 
            cancel_cnt
        ) VALUES (
            NEW.merchant_code,
            biz_date,
            1
        ) ON DUPLICATE KEY UPDATE
            cancel_cnt = cancel_cnt + 1;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_payment_after_update` AFTER UPDATE ON `merchants_payments` FOR EACH ROW BEGIN
    DECLARE biz_date DATE;
    
    -- 정상 거래에서 취소로 변경된 경우만 처리
    IF OLD.is_cancelled = FALSE AND NEW.is_cancelled = TRUE THEN
        SET biz_date = calculate_business_date(NEW.txn_at);
        
        UPDATE merchant_sales 
        SET 
            daily_sales = daily_sales - NEW.cost,
            order_cnt = order_cnt - 1,
            cancel_cnt = cancel_cnt + 1
        WHERE merchant_code = NEW.merchant_code 
          AND sales_date = biz_date;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- 테이블 구조 `merchant_points`
--

CREATE TABLE `merchant_points` (
  `mp_id` int(10) UNSIGNED NOT NULL,
  `merchant_code` varchar(20) NOT NULL,
  `reg_date` date DEFAULT NULL,
  `settle_date` date DEFAULT NULL,
  `settle_status` tinyint(4) DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 테이블의 덤프 데이터 `merchant_points`
--

INSERT INTO `merchant_points` (`mp_id`, `merchant_code`, `reg_date`, `settle_date`, `settle_status`, `note`) VALUES
(4, '1', '2025-09-07', '2025-10-12', 0, '1'),
(5, '2', '2025-09-07', '2025-09-08', 0, '2'),
(7, '3', '2025-09-08', '2025-10-12', 0, '3'),
(8, '4', '2025-09-15', '2025-10-12', 0, '4'),
(9, '5', '2025-09-15', NULL, 1, '5'),
(10, '5', '2025-10-12', '2025-10-12', 0, '2025년 10월 정산 완료');

-- --------------------------------------------------------

--
-- 테이블 구조 `merchant_sales`
--

CREATE TABLE `merchant_sales` (
  `sales_id` int(10) UNSIGNED NOT NULL,
  `merchant_code` varchar(20) NOT NULL,
  `sales_date` date NOT NULL,
  `daily_sales` int(11) DEFAULT 0,
  `order_cnt` int(11) DEFAULT 0,
  `cancel_cnt` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 테이블의 덤프 데이터 `merchant_sales`
--

INSERT INTO `merchant_sales` (`sales_id`, `merchant_code`, `sales_date`, `daily_sales`, `order_cnt`, `cancel_cnt`, `updated_at`) VALUES
(10, '1', '2025-09-07', 300, 1, 0, '2025-09-07 08:26:33'),
(11, '2', '2025-09-07', 400, 1, 0, '2025-09-07 08:26:40'),
(13, '1', '2025-09-08', 800, 8, 0, '2025-09-08 16:34:18'),
(21, '1', '2025-09-15', 300, 3, 0, '2025-09-15 08:30:29'),
(24, '1', '2025-10-11', 100, 1, 1, '2025-10-11 17:25:25'),
(26, '2', '2025-10-11', 500, 2, 0, '2025-10-11 17:46:05'),
(28, '1', '2025-11-03', 100, 1, 0, '2025-11-03 14:31:18');

-- --------------------------------------------------------

--
-- 테이블 구조 `students`
--

CREATE TABLE `students` (
  `s_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `major` varchar(40) DEFAULT NULL,
  `student_no` varchar(20) NOT NULL,
  `points` int(11) DEFAULT 0,
  `pay_pin` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 테이블의 덤프 데이터 `students`
--

INSERT INTO `students` (`s_id`, `user_id`, `name`, `major`, `student_no`, `points`, `pay_pin`) VALUES
(11, 12, '홍길동', '컴퓨터정보공학과', '20230001', 10200, '123456'),
(12, 13, '박수민', '경영학과', '20230002', 9000, '123456'),
(13, 14, '전상윤', '전기전자공학과', '20230003', 8000, ''),
(14, 15, '서동현', '정보통신과', '20230004', 7000, ''),
(15, 16, '신민재', '기계공학과', '20230005', 6000, ''),
(16, 17, '이승현', '건축과', '20230006', 5000, ''),
(17, 18, '최강민', '컴퓨터정보공학과', '20230007', 4000, ''),
(18, 19, '김지연', '정보통신과', '20230008', 6000, ''),
(19, 20, '이수진', '경영학과', '20230009', 2004, ''),
(20, 21, '정혜린', '전기전자공학과', '20230010', 1500, ''),
(21, 104, '김김김', '정보통신과', '20230011', 1409056, '123456');

-- --------------------------------------------------------

--
-- 테이블 구조 `student_points`
--

CREATE TABLE `student_points` (
  `sp_id` int(10) UNSIGNED NOT NULL,
  `student_no` varchar(20) NOT NULL,
  `trx_date` datetime NOT NULL DEFAULT current_timestamp(),
  `point_type` tinyint(4) NOT NULL,
  `point_amount` int(11) NOT NULL,
  `reason` varchar(50) DEFAULT NULL,
  `img_blob` mediumblob DEFAULT NULL,
  `note` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 테이블의 덤프 데이터 `student_points`
--

INSERT INTO `student_points` (`sp_id`, `student_no`, `trx_date`, `point_type`, `point_amount`, `reason`, `img_blob`, `note`) VALUES
(11, '20230001', '2025-03-10 00:00:00', 1, 12000, '자격증', NULL, ''),
(12, '20230002', '2025-04-12 00:00:00', 1, 9000, '봉사활동', NULL, ''),
(13, '20230003', '2025-05-03 00:00:00', 1, 8000, '성적우수', NULL, ''),
(14, '20230004', '2025-03-20 00:00:00', 1, 7000, '성적향상', NULL, ''),
(15, '20230005', '2025-04-01 00:00:00', 1, 6000, '자격증', NULL, ''),
(16, '20230006', '2025-06-10 00:00:00', 1, 5000, '봉사활동', NULL, ''),
(17, '20230007', '2025-05-15 00:00:00', 1, 4000, '성적우수', NULL, ''),
(18, '20230008', '2025-03-11 00:00:00', 1, 3000, '자격증', NULL, ''),
(19, '20230009', '2025-06-05 00:00:00', 1, 2000, '성적향상', NULL, ''),
(20, '20230010', '2025-04-17 00:00:00', 1, 1500, '봉사활동', NULL, ''),
(21, '20230001', '2025-07-28 00:00:00', 2, 1500, '가맹점결제', NULL, '테스트 결제'),
(22, '20230001', '2025-07-28 00:00:00', 1, 1500, '가맹점결제', NULL, '테스트 결제'),
(23, '20230001', '2025-03-15 00:00:00', 1, 800, '봉사활동', NULL, ''),
(24, '20230001', '2025-03-30 00:00:00', 1, 1200, '성적향상', NULL, ''),
(25, '20230001', '2025-04-12 00:00:00', 1, 1500, '자격증', NULL, ''),
(26, '20230001', '2025-05-03 00:00:00', 1, 1000, '성적우수', NULL, ''),
(27, '20230001', '2025-06-18 00:00:00', 1, 900, '봉사활동', NULL, ''),
(28, '20230001', '2025-07-02 00:00:00', 1, 1100, '성적향상', NULL, ''),
(29, '20230001', '2025-04-20 00:00:00', 2, 700, '가맹점결제', NULL, ''),
(30, '20230001', '2025-05-14 00:00:00', 2, 1300, '가맹점결제', NULL, ''),
(31, '20230001', '2025-06-01 00:00:00', 2, 600, '가맹점결제', NULL, ''),
(32, '20230001', '2025-07-10 00:00:00', 2, 800, '가맹점결제', NULL, ''),
(33, '20230001', '2025-08-04 00:00:00', 2, 1000, '가맹점결제', NULL, NULL),
(34, '20230001', '2025-08-04 00:00:00', 2, 500, '가맹점결제', NULL, NULL),
(35, '20230001', '2025-08-04 00:00:00', 2, 500, '가맹점결제', NULL, NULL),
(36, '20230001', '2025-08-04 00:00:00', 2, 500, '가맹점결제', NULL, NULL),
(37, '20230001', '2025-08-04 00:00:00', 2, 600, '가맹점결제', NULL, NULL),
(38, '20230001', '2025-08-04 00:00:00', 2, 500, '가맹점결제', NULL, NULL),
(39, '20230001', '2025-08-04 00:00:00', 2, 500, '가맹점결제', NULL, NULL),
(40, '20230001', '2025-08-04 00:00:00', 2, 100, '가맹점결제', NULL, NULL),
(41, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(42, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(43, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(44, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(45, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(46, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(47, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(48, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(49, '20230011', '2025-08-11 00:00:00', 0, 100, '100', NULL, NULL),
(50, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(51, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(52, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(53, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(54, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(55, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(56, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(57, '20230011', '2025-08-11 00:00:00', 0, 100, '1', NULL, NULL),
(58, '20230011', '2025-08-11 00:00:00', 1, 100, '', NULL, NULL),
(59, '20230011', '2025-08-11 00:00:00', 0, 100, '1111', NULL, NULL),
(60, '20230011', '2025-08-11 00:00:00', 1, 300, '', NULL, NULL),
(61, '20230011', '2025-08-11 00:00:00', 1, 100, '사유', NULL, NULL),
(62, '20230011', '2025-08-11 00:00:00', 1, 100, '자격증', NULL, NULL),
(63, '20230011', '2025-08-11 00:00:00', 0, 200, '오지급', NULL, NULL),
(64, '20230011', '2025-08-11 00:00:00', 1, 500, '123', NULL, NULL),
(65, '20230009', '2025-08-11 00:00:00', 1, 1, '1', NULL, NULL),
(66, '20230009', '2025-08-11 00:00:00', 1, 2, '2', NULL, NULL),
(67, '20230009', '2025-08-11 00:00:00', 0, 3, '3', NULL, NULL),
(68, '20230009', '2025-08-11 00:00:00', 1, 4, '4', NULL, NULL),
(69, '20230011', '2025-08-11 23:47:11', 1, 123, '123', NULL, NULL),
(70, '20230011', '2025-08-11 23:47:18', 1, 1234, '1234', NULL, NULL),
(71, '20230011', '2025-08-17 18:29:15', 1, 300, '12', NULL, NULL),
(72, '20230011', '2025-08-17 23:47:06', 1, 400000, '123', NULL, NULL),
(73, '20230001', '2025-08-18 01:04:45', 2, 1000, '가맹점결제', NULL, NULL),
(74, '20230001', '2025-08-25 22:04:25', 2, 100, '가맹점결제', NULL, NULL),
(75, '20230011', '2025-08-25 22:05:43', 1, 1000, '자격증', NULL, NULL),
(76, '20230011', '2025-08-25 22:05:52', 1, 999999, '자격증', NULL, NULL),
(77, '20230001', '2025-09-07 17:26:33', 2, 300, '가맹점결제', NULL, NULL),
(78, '20230001', '2025-09-07 17:26:40', 2, 400, '가맹점결제', NULL, NULL),
(79, '20230001', '2025-09-07 17:26:47', 2, 500, '가맹점결제', NULL, NULL),
(80, '20230001', '2025-09-08 15:07:51', 2, 100, '가맹점결제', NULL, NULL),
(81, '20230001', '2025-09-08 15:08:15', 2, 100, '가맹점결제', NULL, NULL),
(82, '20230011', '2025-09-08 15:08:50', 1, 1000, '1234', NULL, NULL),
(83, '20230001', '2025-09-08 17:35:40', 2, 100, '가맹점결제', NULL, NULL),
(84, '20230001', '2025-09-08 17:49:48', 2, 100, '가맹점결제', NULL, NULL),
(85, '20230001', '2025-09-08 17:58:04', 2, 100, '가맹점결제', NULL, NULL),
(86, '20230001', '2025-09-08 17:58:42', 2, 100, '가맹점결제', NULL, NULL),
(87, '20230011', '2025-09-08 17:59:55', 1, 2000, '자격증', NULL, NULL),
(88, '20230001', '2025-09-08 18:00:27', 2, 100, '가맹점결제', NULL, NULL),
(89, '20230008', '2025-09-08 18:01:09', 1, 3000, '자격증', NULL, NULL),
(90, '20230001', '2025-09-09 01:34:18', 2, 100, '가맹점결제', NULL, NULL),
(91, '20230001', '2025-09-15 17:30:06', 2, 100, '가맹점결제', NULL, NULL),
(92, '20230001', '2025-09-15 17:30:14', 2, 100, '가맹점결제', NULL, NULL),
(93, '20230001', '2025-09-15 17:30:29', 2, 100, '가맹점결제', NULL, NULL),
(94, '20230001', '2025-10-12 02:01:28', 2, 300, '역전우동', NULL, NULL),
(95, '20230001', '2025-10-12 02:24:33', 1, 300, '역전우동 결제 환불', NULL, NULL),
(96, '20230001', '2025-10-12 02:25:25', 2, 100, '역전우동', NULL, NULL),
(97, '20230001', '2025-10-12 02:41:38', 2, 400, '상점2', NULL, NULL),
(98, '20230001', '2025-10-12 02:46:05', 2, 100, '상점2', NULL, NULL),
(99, '20230001', '2025-11-03 23:31:18', 2, 100, '역전우동', NULL, NULL);

-- --------------------------------------------------------

--
-- 테이블 구조 `users`
--

CREATE TABLE `users` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `user_type` tinyint(3) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 테이블의 덤프 데이터 `users`
--

INSERT INTO `users` (`user_id`, `user_type`, `username`, `password`) VALUES
(12, 1, '1', '$2y$10$IcsvZYUSMY/RlSH2AyRwE.uNJ0AbGbCx8s4EvYspa0CVpxnbIvany'),
(13, 1, '2', '$2y$10$F0zZQ2A6YnJ5bblu4LjaROV/aufpV92dlfoTwjNmfyTeMYMwyhfm6'),
(14, 1, '3', '$2y$10$ONVQ.gJIkMigCEXdHxa4FeyH6ps5Kuftm7fXkHw1G.ZWBNZD.WjnW'),
(15, 1, '4', '$2y$10$6sgDBqbKgpWDQqB4lfgxfeBm.dYD1dzfbL5FWAl.J6dzgCj87MJnK'),
(16, 1, '5', '$2y$10$IO.sz/cgAdJId2gTKXaBCuiAk/5lrvjdm0bXB1WWbJn/8pM8d8IWS'),
(17, 1, '6', '$2y$10$JjQPtHye/TZBn4wRL4XNeOkAX9diuNTEqVsbtdeZO8dhtwNNwgsJm'),
(18, 1, '7', '$2y$10$qEn/8YIUku2XS/4bDL7u8u5jWib7/FMpubX8/472lQdqrhsG1ffRm'),
(19, 1, '8', '$2y$10$fmpPgTODPRp4yTKiTrjHdOjkVbsA7dybHDVlSxyf4fheuZNwQSG.W'),
(20, 1, '9', '$2y$10$4bdgNGzXCbE5TJzG..ZOxuVfgFkeIyHXANbRItLRUKNTNFhQHAACC'),
(21, 0, '10', '$2y$10$BqW28d2gTuImwE6Ir7b19O8rAxCn.vMVWZD/2Dm8KsXRK9u.O4Vry'),
(104, 1, '11', '$2y$10$olVH0Nboz5Blurt7s85B3uD3cGvHd/HgBy/m4D3uA03X0vMLKPBdG'),
(108, 2, '가맹점1', '$2y$10$m4.NwJy8vArhK9rjqxRtdu2a/TTcvvPBExm5KunIdiWijS3ScdUdC'),
(109, 2, '가맹점2', '$2y$10$NHgVXbb8V5LlN/r9cebg3uhdx0Yyfmc62UGrxPZfJ9enTa157oBba'),
(113, 2, '기타3', '$2y$10$n1vD3Ft2qvKl.LucjMEamOrpun7y257lLbbpEECeaOGAA8aLdjFhK'),
(114, 2, '가맹점4', '$2y$10$uV1cgj4tRJMc2Ulj.qajfeV1YqQvl00HiuWMbuY4PNirMyMiwIuAK'),
(115, 2, '가맹점5', '$2y$10$x4SqJiHrEEzAeooTrW1.Pew/JjOCE5bvSECTuqGXjxbrZQYlygWkq');

--
-- 덤프된 테이블의 인덱스
--

--
-- 테이블의 인덱스 `dongyang`
--
ALTER TABLE `dongyang`
  ADD UNIQUE KEY `student_no` (`student_no`);

--
-- 테이블의 인덱스 `merchants`
--
ALTER TABLE `merchants`
  ADD PRIMARY KEY (`m_id`),
  ADD UNIQUE KEY `merchant_code` (`merchant_code`),
  ADD KEY `user_id` (`user_id`);

--
-- 테이블의 인덱스 `merchants_payments`
--
ALTER TABLE `merchants_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `uk_payment` (`merchant_code`,`txn_at`);

--
-- 테이블의 인덱스 `merchant_points`
--
ALTER TABLE `merchant_points`
  ADD PRIMARY KEY (`mp_id`),
  ADD KEY `merchant_code` (`merchant_code`);

--
-- 테이블의 인덱스 `merchant_sales`
--
ALTER TABLE `merchant_sales`
  ADD PRIMARY KEY (`sales_id`),
  ADD UNIQUE KEY `uk_sales` (`merchant_code`,`sales_date`);

--
-- 테이블의 인덱스 `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`s_id`),
  ADD UNIQUE KEY `student_no` (`student_no`),
  ADD KEY `user_id` (`user_id`);

--
-- 테이블의 인덱스 `student_points`
--
ALTER TABLE `student_points`
  ADD PRIMARY KEY (`sp_id`),
  ADD KEY `student_no` (`student_no`);

--
-- 테이블의 인덱스 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- 덤프된 테이블의 AUTO_INCREMENT
--

--
-- 테이블의 AUTO_INCREMENT `merchants`
--
ALTER TABLE `merchants`
  MODIFY `m_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- 테이블의 AUTO_INCREMENT `merchants_payments`
--
ALTER TABLE `merchants_payments`
  MODIFY `payment_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- 테이블의 AUTO_INCREMENT `merchant_points`
--
ALTER TABLE `merchant_points`
  MODIFY `mp_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- 테이블의 AUTO_INCREMENT `merchant_sales`
--
ALTER TABLE `merchant_sales`
  MODIFY `sales_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- 테이블의 AUTO_INCREMENT `students`
--
ALTER TABLE `students`
  MODIFY `s_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- 테이블의 AUTO_INCREMENT `student_points`
--
ALTER TABLE `student_points`
  MODIFY `sp_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- 테이블의 AUTO_INCREMENT `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- 덤프된 테이블의 제약사항
--

--
-- 테이블의 제약사항 `merchants`
--
ALTER TABLE `merchants`
  ADD CONSTRAINT `merchants_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- 테이블의 제약사항 `merchants_payments`
--
ALTER TABLE `merchants_payments`
  ADD CONSTRAINT `merchants_payments_ibfk_1` FOREIGN KEY (`merchant_code`) REFERENCES `merchants` (`merchant_code`);

--
-- 테이블의 제약사항 `merchant_points`
--
ALTER TABLE `merchant_points`
  ADD CONSTRAINT `merchant_points_ibfk_1` FOREIGN KEY (`merchant_code`) REFERENCES `merchants` (`merchant_code`);

--
-- 테이블의 제약사항 `merchant_sales`
--
ALTER TABLE `merchant_sales`
  ADD CONSTRAINT `merchant_sales_ibfk_1` FOREIGN KEY (`merchant_code`) REFERENCES `merchants` (`merchant_code`);

--
-- 테이블의 제약사항 `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- 테이블의 제약사항 `student_points`
--
ALTER TABLE `student_points`
  ADD CONSTRAINT `student_points_ibfk_1` FOREIGN KEY (`student_no`) REFERENCES `students` (`student_no`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
