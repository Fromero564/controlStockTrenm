-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-06-2025 a las 01:17:29
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `trenm_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bill_details`
--

CREATE TABLE `bill_details` (
  `id` int(11) UNSIGNED NOT NULL,
  `bill_supplier_id` int(11) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `heads` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `bill_details`
--

INSERT INTO `bill_details` (`id`, `bill_supplier_id`, `type`, `quantity`, `heads`, `createdAt`, `updatedAt`) VALUES
(6, 9, 'Media Res Capon', 40, 40, '2025-05-14 02:45:23', '2025-05-17 12:54:18'),
(7, 10, 'Media Res Capon', 1000, 10000, '2025-05-16 16:14:00', '2025-05-17 17:36:56'),
(8, 9, 'Media Res Chancha', 10, 10, '2025-05-17 12:54:18', '2025-05-17 12:54:18'),
(9, 11, 'Media Res Chancha', 10, 10, '2025-05-17 13:09:47', '2025-05-17 13:09:47'),
(10, 11, 'Media Res Capon', 4, 4, '2025-05-17 13:09:47', '2025-05-17 13:09:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bill_suppliers`
--

CREATE TABLE `bill_suppliers` (
  `id` int(11) NOT NULL,
  `supplier` varchar(255) NOT NULL,
  `total_weight` varchar(255) NOT NULL,
  `head_quantity` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `romaneo_number` int(255) NOT NULL,
  `income_state` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `check_state` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bill_suppliers`
--

INSERT INTO `bill_suppliers` (`id`, `supplier`, `total_weight`, `head_quantity`, `quantity`, `romaneo_number`, `income_state`, `createdAt`, `updatedAt`, `check_state`) VALUES
(9, 'TREMN SRL', '3337', 1415, 2343, 1235, 'manual', '2025-05-13 19:12:07', '2025-05-17 12:57:02', 0),
(10, 'TREMN SRL', '1240', 10000, 1000, 1250, 'manual', '2025-05-16 16:14:00', '2025-05-17 17:36:56', 0),
(11, 'TREMN SRL', '124.8', 14, 14, 12345, 'romaneo', '2025-05-17 13:09:47', '2025-05-17 13:09:47', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_type_id` varchar(255) NOT NULL,
  `client_id_number` int(11) NOT NULL,
  `client_iva_condition` varchar(255) NOT NULL,
  `client_email` varchar(255) NOT NULL,
  `client_phone` varchar(20) NOT NULL,
  `client_adress` varchar(255) NOT NULL,
  `client_country` varchar(255) NOT NULL,
  `client_province` varchar(255) NOT NULL,
  `client_location` varchar(255) NOT NULL,
  `client_state` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clients`
--

INSERT INTO `clients` (`id`, `client_name`, `client_type_id`, `client_id_number`, `client_iva_condition`, `client_email`, `client_phone`, `client_adress`, `client_country`, `client_province`, `client_location`, `client_state`) VALUES
(2, 'FERNAND', 'DNI', 2147483647, 'CONSUMIDOR FINAL', 'fernando@fernando', '23525325235', 'AV.SAVIO 540', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `meat_manual_income`
--

CREATE TABLE `meat_manual_income` (
  `id` int(11) NOT NULL,
  `id_bill_suppliers` int(11) NOT NULL,
  `products_name` varchar(255) NOT NULL,
  `products_garron` int(11) NOT NULL,
  `products_quantity` varchar(255) NOT NULL,
  `product_head` int(11) NOT NULL,
  `provider_weight` float NOT NULL,
  `gross_weight` float NOT NULL,
  `tare` float NOT NULL,
  `net_weight` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `meat_manual_income`
--

INSERT INTO `meat_manual_income` (`id`, `id_bill_suppliers`, `products_name`, `products_garron`, `products_quantity`, `product_head`, `provider_weight`, `gross_weight`, `tare`, `net_weight`) VALUES
(462, 9, 'Media Res Chancha', 462, '2342', 1414, 2525, 3242, 2.5, 3239.5),
(4454, 9, 'Media Res Capon', 4454, '1', 1, 11515, 100, 2.5, 97.5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `observations_meatincome`
--

CREATE TABLE `observations_meatincome` (
  `id` int(11) NOT NULL,
  `observation` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `observations_meatincome`
--

INSERT INTO `observations_meatincome` (`id`, `observation`) VALUES
(3, 'sin datos'),
(9, 'Nada probando');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `process_meats`
--

CREATE TABLE `process_meats` (
  `id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `average` float NOT NULL,
  `quantity` int(11) NOT NULL,
  `gross_weight` float NOT NULL,
  `tares` float NOT NULL,
  `net_weight` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products_available`
--

CREATE TABLE `products_available` (
  `id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_category` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products_available`
--

INSERT INTO `products_available` (`id`, `product_name`, `product_category`) VALUES
(1, 'Capon', 'primario'),
(2, 'Media Res Capon', 'primario'),
(3, 'Media Res Chancha', 'primario'),
(4, 'Media Res Padrillo', 'primario'),
(5, 'Matambre', 'subproducto');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `providers`
--

CREATE TABLE `providers` (
  `id` int(11) NOT NULL,
  `provider_name` varchar(255) NOT NULL,
  `provider_type_id` varchar(255) NOT NULL,
  `provider_id_number` varchar(20) NOT NULL,
  `provider_iva_condition` varchar(255) NOT NULL,
  `provider_email` varchar(255) NOT NULL,
  `provider_phone` varchar(20) NOT NULL,
  `provider_adress` varchar(255) NOT NULL,
  `provider_country` varchar(255) NOT NULL,
  `provider_province` varchar(255) NOT NULL,
  `provider_location` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `providers`
--

INSERT INTO `providers` (`id`, `provider_name`, `provider_type_id`, `provider_id_number`, `provider_iva_condition`, `provider_email`, `provider_phone`, `provider_adress`, `provider_country`, `provider_province`, `provider_location`) VALUES
(2, 'TRENM', 'CUIT', '325252', 'IVA RESPONSABLE INSCRIPTO', 'tremn@tremn.com', '33642020202', 'AV. SAVIO 555', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS'),
(3, 'FERNADNO', 'CUIT', '2147483647', 'IVA SUJETO EXENTO', 'fer@fer', '32352525', 'BKMSNF', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS'),
(4, 'FERNADNO', 'CUIT', '2147483647', 'IVA SUJETO EXENTO', 'fer@fer', '32352525', 'BKMSNF', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS'),
(5, 'FERNADNO', 'CUIT', '2147483647', 'IVA SUJETO EXENTO', 'fer@fer', '32352525', 'BKMSNF', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS'),
(6, 'FERNADNO', 'CUIT', '2147483647', 'IVA SUJETO EXENTO', 'fer@fer', '32352525', 'BKMSNF', 'ARGENTINA', 'BUENOS AIRES', 'SAN NICOLAS');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tares`
--

CREATE TABLE `tares` (
  `id` int(11) NOT NULL,
  `tare_name` varchar(255) NOT NULL,
  `tare_weight` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tares`
--

INSERT INTO `tares` (`id`, `tare_name`, `tare_weight`) VALUES
(2, 'Cajon Plástico', 1.5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user` varchar(255) NOT NULL,
  `rol` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `create_date` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `user`, `rol`, `password`, `create_date`, `updated_at`) VALUES
(4, 'Admin', 'administrativo', '$2b$10$gu02NCQf/uH4H.GBMh7awuBTHhetWHoX0F6WR9MGSI0PybQJhtKv.', '2025-02-24 18:20:55.000000', '2025-02-24 18:20:55');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `bill_details`
--
ALTER TABLE `bill_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bill_details_bill_supplier_id` (`bill_supplier_id`);

--
-- Indices de la tabla `bill_suppliers`
--
ALTER TABLE `bill_suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `meat_manual_income`
--
ALTER TABLE `meat_manual_income`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_received_suppliers` (`id_bill_suppliers`);

--
-- Indices de la tabla `observations_meatincome`
--
ALTER TABLE `observations_meatincome`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `process_meats`
--
ALTER TABLE `process_meats`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `products_available`
--
ALTER TABLE `products_available`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `providers`
--
ALTER TABLE `providers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tares`
--
ALTER TABLE `tares`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `bill_details`
--
ALTER TABLE `bill_details`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `bill_suppliers`
--
ALTER TABLE `bill_suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `process_meats`
--
ALTER TABLE `process_meats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `products_available`
--
ALTER TABLE `products_available`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `providers`
--
ALTER TABLE `providers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `tares`
--
ALTER TABLE `tares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `bill_details`
--
ALTER TABLE `bill_details`
  ADD CONSTRAINT `fk_bill_details_bill_supplier_id` FOREIGN KEY (`bill_supplier_id`) REFERENCES `bill_suppliers` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `meat_manual_income`
--
ALTER TABLE `meat_manual_income`
  ADD CONSTRAINT `fk_meat_income_received_suppliers` FOREIGN KEY (`id_bill_suppliers`) REFERENCES `bill_suppliers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
