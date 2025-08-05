-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-08-2025 a las 19:49:13
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
  `updatedAt` datetime DEFAULT NULL,
  `weight` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `check_state` tinyint(1) NOT NULL,
  `fresh_quantity` int(11) NOT NULL,
  `fresh_weight` int(11) NOT NULL,
  `production_process` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `net_weight` float NOT NULL,
  `decrease` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `new_orders`
--

CREATE TABLE `new_orders` (
  `id` int(11) NOT NULL,
  `date_order` date NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `salesman_name` varchar(255) NOT NULL,
  `price_list` varchar(255) DEFAULT NULL,
  `sell_condition` varchar(255) NOT NULL,
  `payment_condition` varchar(255) NOT NULL,
  `observation_order` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `observations_meatincome`
--

CREATE TABLE `observations_meatincome` (
  `id` int(11) NOT NULL,
  `observation` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_products_client`
--

CREATE TABLE `order_products_client` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_cod` varchar(50) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `tipo_medida` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `other_product_manual`
--

CREATE TABLE `other_product_manual` (
  `id` int(11) NOT NULL,
  `product_portion` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `product_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `product_gross_weight` float NOT NULL,
  `product_net_weight` float NOT NULL,
  `decrease` float NOT NULL,
  `id_bill_suppliers` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `price_lists`
--

CREATE TABLE `price_lists` (
  `id` int(11) NOT NULL,
  `list_number` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `client_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `price_list_products`
--

CREATE TABLE `price_list_products` (
  `id` int(11) NOT NULL,
  `price_list_number` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `unidad_venta` varchar(20) NOT NULL,
  `costo` decimal(12,2) DEFAULT 0.00,
  `precio_sin_iva` decimal(12,2) DEFAULT 0.00,
  `precio_con_iva` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `net_weight` float NOT NULL,
  `process_number` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `process_number`
--

CREATE TABLE `process_number` (
  `id` int(11) NOT NULL,
  `process_number` int(11) NOT NULL,
  `bill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products_available`
--

CREATE TABLE `products_available` (
  `id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_general_category` varchar(255) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `min_stock` int(11) NOT NULL,
  `max_stock` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_categories`
--

CREATE TABLE `product_categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_stock`
--

CREATE TABLE `product_stock` (
  `id` int(11) NOT NULL,
  `product_name` varchar(160) NOT NULL,
  `product_quantity` int(11) NOT NULL,
  `product_cod` int(11) NOT NULL,
  `product_category` varchar(255) NOT NULL,
  `product_total_weight` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_subproducts`
--

CREATE TABLE `product_subproducts` (
  `id` int(11) NOT NULL,
  `parent_product_id` int(11) NOT NULL,
  `subproduct_id` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL CHECK (`quantity` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sellers`
--

CREATE TABLE `sellers` (
  `id` int(11) NOT NULL,
  `code` varchar(32) NOT NULL,
  `name` varchar(128) NOT NULL,
  `province` varchar(64) DEFAULT NULL,
  `city` varchar(64) DEFAULT NULL,
  `street` varchar(80) DEFAULT NULL,
  `number` varchar(16) DEFAULT NULL,
  `floor` varchar(16) DEFAULT NULL,
  `office` varchar(32) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tares`
--

CREATE TABLE `tares` (
  `id` int(11) NOT NULL,
  `tare_name` varchar(255) NOT NULL,
  `tare_weight` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `warehouses`
--

CREATE TABLE `warehouses` (
  `id` int(11) NOT NULL,
  `warehouse_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `warehouse_stock`
--

CREATE TABLE `warehouse_stock` (
  `id` int(11) NOT NULL,
  `id_warehouse` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Indices de la tabla `new_orders`
--
ALTER TABLE `new_orders`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `observations_meatincome`
--
ALTER TABLE `observations_meatincome`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `order_products_client`
--
ALTER TABLE `order_products_client`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order` (`order_id`);

--
-- Indices de la tabla `other_product_manual`
--
ALTER TABLE `other_product_manual`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bill_suppliers` (`id_bill_suppliers`);

--
-- Indices de la tabla `price_lists`
--
ALTER TABLE `price_lists`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `price_list_products`
--
ALTER TABLE `price_list_products`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `process_meats`
--
ALTER TABLE `process_meats`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `process_number`
--
ALTER TABLE `process_number`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `products_available`
--
ALTER TABLE `products_available`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_products_available_category` (`category_id`);

--
-- Indices de la tabla `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Indices de la tabla `product_stock`
--
ALTER TABLE `product_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_cod` (`product_cod`);

--
-- Indices de la tabla `product_subproducts`
--
ALTER TABLE `product_subproducts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_product_id` (`parent_product_id`),
  ADD KEY `subproduct_id` (`subproduct_id`);

--
-- Indices de la tabla `providers`
--
ALTER TABLE `providers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sellers`
--
ALTER TABLE `sellers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

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
-- Indices de la tabla `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `warehouse_stock`
--
ALTER TABLE `warehouse_stock`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_warehouse` (`id_warehouse`,`product_name`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `bill_details`
--
ALTER TABLE `bill_details`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `bill_suppliers`
--
ALTER TABLE `bill_suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `meat_manual_income`
--
ALTER TABLE `meat_manual_income`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `new_orders`
--
ALTER TABLE `new_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `order_products_client`
--
ALTER TABLE `order_products_client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `other_product_manual`
--
ALTER TABLE `other_product_manual`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `price_lists`
--
ALTER TABLE `price_lists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `price_list_products`
--
ALTER TABLE `price_list_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `process_meats`
--
ALTER TABLE `process_meats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `process_number`
--
ALTER TABLE `process_number`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_stock`
--
ALTER TABLE `product_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `product_subproducts`
--
ALTER TABLE `product_subproducts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `providers`
--
ALTER TABLE `providers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sellers`
--
ALTER TABLE `sellers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tares`
--
ALTER TABLE `tares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `warehouse_stock`
--
ALTER TABLE `warehouse_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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

--
-- Filtros para la tabla `order_products_client`
--
ALTER TABLE `order_products_client`
  ADD CONSTRAINT `fk_order` FOREIGN KEY (`order_id`) REFERENCES `new_orders` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `other_product_manual`
--
ALTER TABLE `other_product_manual`
  ADD CONSTRAINT `fk_bill_suppliers` FOREIGN KEY (`id_bill_suppliers`) REFERENCES `bill_suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `products_available`
--
ALTER TABLE `products_available`
  ADD CONSTRAINT `fk_products_available_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`);

--
-- Filtros para la tabla `product_stock`
--
ALTER TABLE `product_stock`
  ADD CONSTRAINT `fk_product_cod` FOREIGN KEY (`product_cod`) REFERENCES `products_available` (`id`);

--
-- Filtros para la tabla `product_subproducts`
--
ALTER TABLE `product_subproducts`
  ADD CONSTRAINT `product_subproducts_ibfk_1` FOREIGN KEY (`parent_product_id`) REFERENCES `products_available` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_subproducts_ibfk_2` FOREIGN KEY (`subproduct_id`) REFERENCES `products_available` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `warehouse_stock`
--
ALTER TABLE `warehouse_stock`
  ADD CONSTRAINT `warehouse_stock_ibfk_1` FOREIGN KEY (`id_warehouse`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
