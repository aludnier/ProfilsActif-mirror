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
INSERT INTO `app_user` VALUES ('7230192e-a71a-11f1-9986-1cce51bbf125','Jean','Dupont','jean.dupont@test.fr','0612345678','$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890','seeker','active','2026-09-03 00:05:45','2026-09-03 00:05:45',NULL);
/*!40000 ALTER TABLE `app_user` ENABLE KEYS */;
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
INSERT INTO `seeker` VALUES ('7230192e-a71a-11f1-9986-1cce51bbf125','Paris','Développement web',50,'2026-09-03 00:05:45','2026-09-03 00:05:45');
/*!40000 ALTER TABLE `seeker` ENABLE KEYS */;
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
