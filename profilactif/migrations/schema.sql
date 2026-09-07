-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: profilsactif
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `app_user`
--

DROP TABLE IF EXISTS `app_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_user` (
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('seeker','recruiter','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','suspended','deleted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `age` tinyint unsigned DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uq_app_user_mail` (`mail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_user`
--

LOCK TABLES `app_user` WRITE;
/*!40000 ALTER TABLE `app_user` DISABLE KEYS */;
INSERT INTO `app_user`
(`uuid`,`first_name`,`last_name`,`mail`,`phone`,`password_hash`,`role`,`status`,`created_at`,`updated_at`,`age`)
VALUES
('6b1cf6e3-908f-485a-a6ee-2d6d5ea6b1de','Marie','Martin','marie.martin@test.fr','0611000001','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('9200a12e-d293-46b8-9dfe-fb3f88082f1d','Lucas','Bernard','lucas.bernard@test.fr','0611000002','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('070dc6c4-5cf2-46a7-a6bf-158d00cd09d0','Camille','Robert','camille.robert@test.fr','0611000003','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('ea1cb908-fd03-4875-ac8a-8e26709c77db','Thomas','Richard','thomas.richard@test.fr','0611000004','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('c87edb8d-5bad-4144-81b1-6a521f514ec0','Emma','Petit','emma.petit@test.fr','0611000005','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('7afa9de9-003c-498c-bbbb-2a877f5fc710','Hugo','Durand','hugo.durand@test.fr','0611000006','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('85235de3-dbf0-4821-b4af-4a77722e8630','Chloé','Leroy','chloe.leroy@test.fr','0611000007','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('4b27141b-43e0-49fe-a636-f3b7b05182cd','Nathan','Moreau','nathan.moreau@test.fr','0611000008','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('a8a128e4-f73a-470d-90d6-7dd7c3f30c24','Sarah','Simon','sarah.simon@test.fr','0611000009','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('c4dfd2e4-2428-4b15-a534-a564aed2bdb2','Louis','Laurent','louis.laurent@test.fr','0611000010','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('3abd2b94-b41f-4d17-9952-c4540a33c640','Manon','Lefebvre','manon.lefebvre@test.fr','0611000011','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('e3fe5744-d4f3-42bf-9abd-8de0f415eb52','Gabriel','Michel','gabriel.michel@test.fr','0611000012','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('09c0b5a1-e805-4c1e-aaeb-58bfbe94cf6d','Inès','Garcia','ines.garcia@test.fr','0611000013','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('304338bd-e705-42d0-a38d-a923772d7e29','Arthur','David','arthur.david@test.fr','0611000014','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('5a0bc708-d22f-4054-b6b1-d62709482008','Jade','Bertrand','jade.bertrand@test.fr','0611000015','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('419c34ad-9ffa-4c7d-acf5-3c224979a7d6','Maxime','Roux','maxime.roux@test.fr','0611000016','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('90778d0f-9f70-47a9-a770-541a7b239c24','Alice','Vincent','alice.vincent@test.fr','0611000017','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('cab5d5bf-8085-4447-b67a-b72059d7b35a','Paul','Fournier','paul.fournier@test.fr','0611000018','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('8585d5d6-8b21-4fde-b2cf-fed91bff16c5','Léa','Morel','lea.morel@test.fr','0611000019','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('e03c0d6f-cc8f-4c62-85a9-648aefd64a60','Antoine','Girard','antoine.girard@test.fr','0611000020','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('df0adee9-e2a8-4487-9653-3b6b17b5e10f','Zoé','André','zoe.andre@test.fr','0611000021','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('a86c75be-5379-4b84-930b-34ef158854f7','Romain','Mercier','romain.mercier@test.fr','0611000022','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('65541133-2709-4b02-b053-3a5ea55af5e9','Juliette','Dupuis','juliette.dupuis@test.fr','0611000023','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('8c0588fc-3f56-4c60-afa3-d03d3e5c53fd','Victor','Lambert','victor.lambert@test.fr','0611000024','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('c534dbba-a181-45d2-85f6-204f973a1615','Clara','Bonnet','clara.bonnet@test.fr','0611000025','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('36f8896f-e710-497c-976a-9c807ef34180','Théo','François','theo.francois@test.fr','0611000026','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('59e627ab-f021-4e54-a741-9c4c500964d0','Louise','Legrand','louise.legrand@test.fr','0611000027','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('76d71e1f-4089-4eb4-8105-dd0aa6368e1a','Sacha','Garnier','sacha.garnier@test.fr','0611000028','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('0f66411d-08da-44e4-a243-f88af04c0072','Émilie','Faure','emilie.faure@test.fr','0611000029','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL),
('14133474-948a-44ec-a008-acc009e27a5e','Baptiste','Rousseau','baptiste.rousseau@test.fr','0611000030','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-04 00:00:00','2026-09-04 00:00:00',NULL);/*!40000 ALTER TABLE `app_user` ENABLE KEYS */;

INSERT INTO app_user 
(uuid, first_name, last_name, mail, phone, password_hash, role, status) 
VALUES 
(UUID(), 'Admin', 'User', 'admin@example.com', NULL, '$2a$10$slYQmyNdGzin7olVN3p5be7DlH.PKZbv5H8KnzzVgXXbVxpva.pFm', 'admin', 'active');
UNLOCK TABLES;
--
-- Table structure for table `contact`
--

DROP TABLE IF EXISTS `contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `recruiter_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seeker_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_contact_recruiter` (`recruiter_id`),
  KEY `idx_contact_seeker_id` (`seeker_id`),
  CONSTRAINT `fk_contact_recruiter` FOREIGN KEY (`recruiter_id`) REFERENCES `recruiter` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_contact_seeker` FOREIGN KEY (`seeker_id`) REFERENCES `seeker` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact`
--

LOCK TABLES `contact` WRITE;
/*!40000 ALTER TABLE `contact` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite`
--

DROP TABLE IF EXISTS `favorite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `recruiter_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seeker_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_favorite_recruiter_seeker` (`recruiter_id`,`seeker_id`),
  KEY `idx_favorite_seeker_id` (`seeker_id`),
  CONSTRAINT `fk_favorite_recruiter` FOREIGN KEY (`recruiter_id`) REFERENCES `recruiter` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorite_seeker` FOREIGN KEY (`seeker_id`) REFERENCES `seeker` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite`
--

LOCK TABLES `favorite` WRITE;
/*!40000 ALTER TABLE `favorite` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recruiter`
--

DROP TABLE IF EXISTS `recruiter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recruiter` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_recruiter_user` FOREIGN KEY (`id`) REFERENCES `app_user` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recruiter`
--

LOCK TABLES `recruiter` WRITE;
/*!40000 ALTER TABLE `recruiter` DISABLE KEYS */;
/*!40000 ALTER TABLE `recruiter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seeker`
--

DROP TABLE IF EXISTS `seeker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seeker` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_sector` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employment_type` enum('full_time','part_time','freelance','internship') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_mode` enum('on_site','hybrid','remote') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_years` decimal(4,1) unsigned DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `certification_rate` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_seeker_user` FOREIGN KEY (`id`) REFERENCES `app_user` (`uuid`) ON DELETE CASCADE,
  CONSTRAINT `chk_seeker_certification_rate` CHECK ((`certification_rate` between 0 and 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seeker`
--

LOCK TABLES `seeker` WRITE;
/*!40000 ALTER TABLE `seeker` DISABLE KEYS */;
INSERT INTO `seeker`
(`id`,`location`,`target_sector`,`employment_type`,`work_mode`,`experience_years`,`bio`,`certification_rate`,`created_at`,`updated_at`)
VALUES
('6b1cf6e3-908f-485a-a6ee-2d6d5ea6b1de','Paris','Développement web','full_time','hybrid',3.0,'Développeuse web passionnée par les applications modernes et l’expérience utilisateur.',80,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('9200a12e-d293-46b8-9dfe-fb3f88082f1d','Lyon','Data & IA','full_time','remote',4.0,'Data analyst orienté Python, SQL et visualisation de données.',75,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('070dc6c4-5cf2-46a7-a6bf-158d00cd09d0','Bordeaux','Marketing digital','full_time','hybrid',2.5,'Spécialiste du marketing digital, campagnes sociales et acquisition.',70,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('ea1cb908-fd03-4875-ac8a-8e26709c77db','Nantes','Cybersécurité','full_time','on_site',5.0,'Ingénieur cybersécurité intéressé par la sécurité applicative et le cloud.',90,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('c87edb8d-5bad-4144-81b1-6a521f514ec0','Toulouse','Design UX/UI','freelance','remote',3.5,'Designer UX/UI créative, centrée sur les parcours utilisateurs.',85,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('7afa9de9-003c-498c-bbbb-2a877f5fc710','Lille','Développement mobile','full_time','hybrid',4.0,'Développeur mobile spécialisé Android, Kotlin et architectures modernes.',80,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('85235de3-dbf0-4821-b4af-4a77722e8630','Paris','Ressources humaines','full_time','hybrid',2.0,'Chargée RH avec un intérêt pour le recrutement et la marque employeur.',65,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('4b27141b-43e0-49fe-a636-f3b7b05182cd','Strasbourg','Cloud & DevOps','full_time','remote',6.0,'Ingénieur DevOps spécialisé CI/CD, Docker et environnements cloud.',95,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('a8a128e4-f73a-470d-90d6-7dd7c3f30c24','Montpellier','Communication','part_time','hybrid',2.5,'Chargée de communication polyvalente, rédaction et stratégie éditoriale.',70,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('c4dfd2e4-2428-4b15-a534-a564aed2bdb2','Rennes','Développement web','internship','on_site',0.5,'Étudiant en développement web à la recherche d’une première expérience.',50,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('3abd2b94-b41f-4d17-9952-c4540a33c640','Paris','Finance','full_time','hybrid',5.0,'Analyste financière avec expérience en reporting et contrôle de gestion.',85,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('e3fe5744-d4f3-42bf-9abd-8de0f415eb52','Nice','Développement web','full_time','remote',7.0,'Développeur backend expérimenté, APIs, bases de données et architecture logicielle.',90,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('09c0b5a1-e805-4c1e-aaeb-58bfbe94cf6d','Marseille','Commerce','full_time','on_site',3.0,'Commerciale B2B orientée relation client et développement de portefeuille.',75,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('304338bd-e705-42d0-a38d-a923772d7e29','Grenoble','Électronique','full_time','on_site',4.5,'Ingénieur électronique intéressé par les systèmes embarqués.',80,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('5a0bc708-d22f-4054-b6b1-d62709482008','Paris','Gestion de projet','full_time','hybrid',6.0,'Cheffe de projet organisée, expérience en coordination d’équipes pluridisciplinaires.',90,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('419c34ad-9ffa-4c7d-acf5-3c224979a7d6','Lyon','Développement web','freelance','remote',5.5,'Développeur full-stack freelance, JavaScript, TypeScript et API.',85,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('90778d0f-9f70-47a9-a770-541a7b239c24','Dijon','Comptabilité','full_time','hybrid',4.0,'Comptable rigoureuse, spécialisée en suivi financier et clôtures.',80,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('cab5d5bf-8085-4447-b67a-b72059d7b35a','Toulouse','Logistique','full_time','on_site',8.0,'Responsable logistique avec expérience en optimisation des flux.',90,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('8585d5d6-8b21-4fde-b2cf-fed91bff16c5','Brest','Développement web','full_time','remote',2.0,'Développeuse frontend intéressée par React, accessibilité et performance.',70,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('e03c0d6f-cc8f-4c62-85a9-648aefd64a60','Paris','Vente','full_time','hybrid',3.5,'Business developer orienté prospection, négociation et fidélisation.',75,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('df0adee9-e2a8-4487-9653-3b6b17b5e10f','Clermont-Ferrand','Data & IA','internship','hybrid',1.0,'Étudiante en data science, motivée par Python, statistiques et machine learning.',55,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('a86c75be-5379-4b84-930b-34ef158854f7','Rennes','Infrastructure','full_time','on_site',6.5,'Administrateur systèmes avec expérience Linux, réseaux et virtualisation.',90,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('65541133-2709-4b02-b053-3a5ea55af5e9','Paris','Événementiel','part_time','hybrid',3.0,'Chargée d’événementiel, coordination fournisseurs et organisation opérationnelle.',65,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('8c0588fc-3f56-4c60-afa3-d03d3e5c53fd','Montpellier','Développement mobile','full_time','remote',3.5,'Développeur iOS passionné par Swift et les interfaces mobiles.',80,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('c534dbba-a181-45d2-85f6-204f973a1615','Lyon','Design UX/UI','full_time','hybrid',4.0,'Product designer avec expérience en recherche utilisateur et prototypage.',85,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('36f8896f-e710-497c-976a-9c807ef34180','Nantes','Automatisation','full_time','remote',5.0,'Ingénieur automatisation, scripting et intégration de workflows.',80,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('59e627ab-f021-4e54-a741-9c4c500964d0','Bordeaux','Tourisme','full_time','on_site',4.0,'Professionnelle du tourisme, relation client et gestion de partenaires.',70,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('76d71e1f-4089-4eb4-8105-dd0aa6368e1a','Paris','Développement web','freelance','hybrid',8.0,'Développeur senior spécialisé backend, microservices et bases de données.',95,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('0f66411d-08da-44e4-a243-f88af04c0072','Strasbourg','Qualité','full_time','hybrid',5.5,'Responsable qualité orientée amélioration continue et procédures.',85,'2026-09-04 00:00:00','2026-09-04 00:00:00'),
('14133474-948a-44ec-a008-acc009e27a5e','Lille','Support IT','full_time','on_site',3.0,'Technicien support IT, résolution d’incidents et accompagnement des utilisateurs.',75,'2026-09-04 00:00:00','2026-09-04 00:00:00');/*!40000 ALTER TABLE `seeker` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seeker_skill`
--

DROP TABLE IF EXISTS `seeker_skill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seeker_skill` (
  `seeker_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `skill_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`seeker_id`,`skill_id`),
  KEY `fk_seeker_skill_skill` (`skill_id`),
  CONSTRAINT `fk_seeker_skill_seeker` FOREIGN KEY (`seeker_id`) REFERENCES `seeker` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_seeker_skill_skill` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seeker_skill`
--

LOCK TABLES `seeker_skill` WRITE;
/*!40000 ALTER TABLE `seeker_skill` DISABLE KEYS */;
/*!40000 ALTER TABLE `seeker_skill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skill`
--

DROP TABLE IF EXISTS `skill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skill` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_skill_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skill`
--

LOCK TABLES `skill` WRITE;
/*!40000 ALTER TABLE `skill` DISABLE KEYS */;
/*!40000 ALTER TABLE `skill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video`
--

DROP TABLE IF EXISTS `video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `seeker_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_video_seeker_id` (`seeker_id`),
  CONSTRAINT `fk_video_seeker` FOREIGN KEY (`seeker_id`) REFERENCES `seeker` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_video_url_not_blank` CHECK ((char_length(trim(`url`)) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video`
--

LOCK TABLES `video` WRITE;
/*!40000 ALTER TABLE `video` DISABLE KEYS */;
/*!40000 ALTER TABLE `video` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Feature certification : questionnaire versionne et reprise des tentatives.
CREATE TABLE IF NOT EXISTS questionnaire (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  code VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  created_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_questionnaire_code (code),
  CONSTRAINT fk_questionnaire_creator
    FOREIGN KEY (created_by) REFERENCES app_user(uuid) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS certification (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  question VARCHAR(200) NOT NULL,
  responses JSON NOT NULL,
  question_weight INT NOT NULL,
  type enum('single', 'multiple') NOT NULL DEFAULT 'single',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questionnaire_version (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  questionnaire_id CHAR(36) NOT NULL,
  version INT UNSIGNED NOT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  content JSON NOT NULL,
  created_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_questionnaire_version (questionnaire_id, version),
  CONSTRAINT fk_questionnaire_version_questionnaire
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaire(id) ON DELETE CASCADE,
  CONSTRAINT fk_questionnaire_version_creator
    FOREIGN KEY (created_by) REFERENCES app_user(uuid) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questionnaire_attempt (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  questionnaire_version_id CHAR(36) NOT NULL,
  seeker_id CHAR(36) NOT NULL,
  status ENUM('in_progress', 'submitted', 'abandoned') NOT NULL DEFAULT 'in_progress',
  answers JSON NOT NULL,
  score DECIMAL(5,2) NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_questionnaire_attempt_seeker (seeker_id, updated_at),
  CONSTRAINT fk_questionnaire_attempt_version
    FOREIGN KEY (questionnaire_version_id) REFERENCES questionnaire_version(id) ON DELETE RESTRICT,
  CONSTRAINT fk_questionnaire_attempt_seeker
    FOREIGN KEY (seeker_id) REFERENCES seeker(id) ON DELETE CASCADE,
  CONSTRAINT chk_questionnaire_attempt_score
    CHECK (score IS NULL OR (score >= 0 AND score <= 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE video
  ADD COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  ADD COLUMN moderated_by CHAR(36) NULL,
  ADD COLUMN moderated_at DATETIME NULL,
  ADD COLUMN moderation_reason VARCHAR(500) NULL;

-- Compte local de developpement.
INSERT INTO app_user
  (uuid, first_name, last_name, mail, phone, password_hash, role, status)
VALUES
  (UUID(), 'superAdmin', 'ProfilsActifs', 'superAdmin@profilsactifs.local', NULL,
   '$2a$10$RiQm6qc0gNmlrdMkjJ8q4.40U8ev52QXKTbC0e.ScmHVHPbtWixxu',
   'admin', 'active')
ON DUPLICATE KEY UPDATE role = 'admin', status = 'active';
