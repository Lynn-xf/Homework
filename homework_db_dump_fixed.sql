/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: homework_db
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text NOT NULL,
  `ai_prompt_comment` text DEFAULT NULL,
  `ai_comment` text DEFAULT NULL,
  `commentBy` int(11) NOT NULL,
  `commentTo` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `commentBy` (`commentBy`),
  KEY `commentTo` (`commentTo`),
  CONSTRAINT `comments_ibfk_125` FOREIGN KEY (`commentBy`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_126` FOREIGN KEY (`commentTo`) REFERENCES `notes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES
('01dc0ec7-85a2-4e1c-9e1b-a4a6a049dacb','masterpiece','pencil trees','How about exploring the artwork \"Tree\" by Sanford Robinson Gifford? Here\'s a preview: https://nrs.harvard.edu/urn-3:HUAM:788124\nMore details: ',1,NULL,'2025-08-30 09:27:23','2025-08-30 09:27:23'),
('1923c5f4-802a-4063-a8fb-a71e8f9394c4','It\'s a cool idea. But it\'s not clear for the theme when you mention about intelligent city','in the future','How about exploring the artwork \"The Future Decentralization\" by Honoré-Victorin Daumier? Here\'s a preview: \nMore details: ',1,NULL,'2025-08-30 02:12:13','2025-08-30 02:12:13'),
('1e1ac824-099f-45dc-ad14-88ad8edbb984','it\'s good','traditional architecture','How about exploring the artwork \"Tile with interlocking half-palmettes and rosettes\"? Here\'s a preview: https://nrs.harvard.edu/urn-3:HUAM:DDC252363_dynmc\nMore details: ',1,129,'2025-08-30 11:04:30','2025-08-30 11:04:30'),
('1fa4d0f6-83ae-4290-b41b-6761eec5baec','masterpiece','trees','How about exploring the artwork \"Trees; verso: Trees\" by Edward Burne-Jones? Here\'s a preview: https://nrs.harvard.edu/urn-3:HUAM:51691_dynmc\nMore details: ',1,NULL,'2025-08-30 10:26:22','2025-08-30 10:26:22'),
('2388e615-30bb-4132-8e3f-611783ee6186','hwy I cant make comment','','',1,NULL,'2025-08-30 00:45:28','2025-08-30 00:45:28'),
('38480c01-150b-424f-8174-5bc7f974d651','masterpiece','chinese traditional art','How about exploring the artwork \"Album of Chinese Export Paintings: Traditional Costume\"? Here\'s a preview: https://nrs.harvard.edu/urn-3:HUAM:CARP10632_dynmc\nMore details: ',1,NULL,'2025-08-30 09:02:50','2025-08-30 09:02:50'),
('5f1af512-57ae-4a6f-972d-a4a97034cda6','it\'s beaautiful','traditional architecture','How about exploring the artwork \"Tile with interlocking half-palmettes and rosettes\"? Here\'s a preview: https://nrs.harvard.edu/urn-3:HUAM:DDC252363_dynmc\nMore details: ',1,NULL,'2025-08-30 10:44:10','2025-08-30 10:44:10'),
('72ccbb4a-4257-4f83-8cda-9228d46be68b','this is good','traditional architecture','How about exploring the artwork \"Tile with interlocking half-palmettes and rosettes\"? Here\'s a preview: https://nrs.harvard.edu/urn-3:HUAM:DDC252363_dynmc\nMore details: ',1,130,'2025-08-30 11:13:40','2025-08-30 11:13:40'),
('74292ffc-b5bf-4dde-9010-7f4495906264','okay how about traditional architecture','traditional architecture','How about exploring the artwork \"Tile with interlocking half-palmettes and rosettes\"? Here\'s a preview: https://nrs.harvard.edu/urn-3:HUAM:DDC252363_dynmc\nMore details: ',1,NULL,'2025-08-30 09:19:52','2025-08-30 09:19:52'),
('76de4eb1-ac3d-4cb7-8450-96e61ad6e6f3','yes','traditional architecture','How about exploring the artwork \"Tile with interlocking half-palmettes and rosettes\"? Here\'s a preview: https://nrs.harvard.edu/urn-3:HUAM:DDC252363_dynmc\nMore details: ',1,NULL,'2025-08-30 09:35:47','2025-08-30 09:35:47'),
('86f5dc72-6e38-4a3f-865b-4ff6c04bc3e2','cool mechanism, recommend to put some background research too','civil engineering traditional','No matching artwork found for \"civil engineering traditional\".',1,NULL,'2025-08-30 09:19:03','2025-08-30 09:19:03'),
('98f536e3-f1a8-4977-9fce-5a74b1be83a7','hello','','',1,NULL,'2025-08-30 00:43:57','2025-08-30 00:43:57'),
('99161c6c-38f0-4589-9910-53839839cbb9','masterpiece','traditional architecture','How about exploring the artwork \"Tile with interlocking half-palmettes and rosettes\"? Here\'s a preview: https://nrs.harvard.edu/urn-3:HUAM:DDC252363_dynmc\nMore details: ',1,NULL,'2025-08-30 10:06:47','2025-08-30 10:06:47'),
('b032062d-e09d-457d-80e2-f0e2961069ef','hi','','',2,NULL,'2025-08-30 00:57:51','2025-08-30 00:57:51'),
('ba119f49-9de9-499c-b6b1-c0d2ad5d753d','masterpiece','check more on chinese traditional black and white trees','No matching artwork found for \"check more on chinese traditional black and white trees\".',1,NULL,'2025-08-30 09:27:05','2025-08-30 09:27:05'),
('d8cb5eb4-2460-44cb-9fe7-0775880bee51','sorry for no show of link','future city','How about exploring the artwork \"Artist\'s documents: correspondence from collectors, 1975-76\" by Christopher Wilmarth? Here\'s a preview: \nMore details: ',1,NULL,'2025-08-30 02:12:55','2025-08-30 02:12:55'),
('f9b27be4-7bdf-45fa-967d-bea91c0b9cb0','good','','',1,NULL,'2025-08-30 00:45:07','2025-08-30 00:45:07'),
('fde1dfda-4d0b-4fc4-887e-da823c11926e','test ','1993','How about exploring the artwork \"Coin of Sardis under Faustina I\" by Faustina I? Here\'s a preview: https://nrs.harvard.edu/urn-3:huam:COIN19070_dynmc\nMore details: ',1,NULL,'2025-08-30 01:51:00','2025-08-30 01:51:00');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `note_title` varchar(255) NOT NULL,
  `note_picture` varchar(255) NOT NULL,
  `ai_summary` text DEFAULT NULL,
  `time` varchar(255) DEFAULT NULL,
  `ownerId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ownerId` (`ownerId`),
  CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES
(128,'sketch','design.jpg','Here\'s a summary of the content in the image:\n\n**The Image:** The image is a hand-drawn, somewhat schematic sketch of a modern sofa. It\'s presented in an exploded view with various components labeled.\n\n**Key Elements & Labels:**\n\n*   **Slides Under Sofa:** The primary focus is the slides located under the sofa.\n*   **Steel (Chrome):** Indicates the material of the slides.\n*   **Modular Components:** These are the main structural pieces of the sofa.\n*   **Angles:** The drawing also notes angles of 160 degrees.\n*   **Flat Packed Modular? Repairable?** Indicates the assembly and potentially the repair of this sofa.\n\n**Overall Impression:**\n\nThe image appears to be a design or engineering sketch, likely for a modular or flat-pack sofa. It includes notes and annotations to clarify specific components and design considerations.\n\nDo you want me to elaborate on any specific aspect of the image or perhaps describe the video being shown alongside it?',NULL,NULL),
(129,'painting','sketch.jpeg','Here\'s a summary of the image:\n\nThis is a black and white landscape drawing, likely a sketch. It depicts a small village or settlement nestled along the shore of a body of water (probably a lake or river). The buildings are in a traditional style, with steeply pitched roofs reminiscent of Scottish or Northern European architecture. The foreground features dark, bushy trees and a body of water that mirrors the buildings.  The overall effect is a serene, atmospheric view of a remote location.',NULL,NULL),
(130,'for test','trees.jpg','Here’s a summary of the image:\n\nThe image is a detailed pencil drawing of a wintry landscape. It features three large, gnarled tree trunks dominating the foreground. The trees have exposed branches and textured bark, highlighting their age and strength. \n\nThe ground is covered in a light dusting of snow, and there is a small patch of grass at the base of the trees. The background is a muted grey sky, suggesting a cloudy winter day. The artwork utilizes strong shading and line work to create a sense of depth and atmosphere. \n\nIt has a rather somber and dramatic feel, emphasizing the trees\' resilience against the elements.\n\nDo you want me to focus on any particular aspect of the drawing, such as the technique or the mood?',NULL,NULL),
(131,'for test','trees.jpg','Here\'s a summary of the image:\n\nThis is a detailed graphite pencil drawing of a wintry landscape. The focal point is a cluster of three large, gnarled trees with thick, textured trunks and branches. The trees are stark and bare of leaves, suggesting winter. The ground is covered in a layer of snow and sparse, dried grasses.  The artist has used shading and cross-hatching effectively to convey the texture of the bark, snow, and the way the light falls across the scene. The overall mood is quiet and contemplative, highlighting the beauty of a bare winter landscape.',NULL,NULL),
(132,'Test Note 2','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(133,'Test Note 1','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(134,'Test Note 3','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(135,'Test Note 4','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(136,'Test Note 5','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(137,'Test Note 6','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(138,'Test Note 7','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(139,'Test Note 8','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(140,'Test Note 10','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(141,'Test Note 9','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(142,'Test Note 11','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(143,'Test Note 12','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(144,'Test Note 13','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(145,'Test Note 14','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(146,'Test Note 15','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(147,'Test Note 16','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(148,'Test Note 18','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(149,'Test Note 17','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(150,'Test Note 20','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(151,'Test Note 19','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(152,'Test Note 22','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(153,'Test Note 21','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(154,'Test Note 23','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(155,'Test Note 24','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(156,'Test Note 25','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(157,'Test Note 26','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(158,'Test Note 28','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(159,'Test Note 27','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(160,'Test Note 30','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(161,'Test Note 29','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(162,'Test Note 32','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(163,'Test Note 31','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(164,'Test Note 33','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(165,'Test Note 34','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(166,'Test Note 36','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(167,'Test Note 35','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(168,'Test Note 38','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(169,'Test Note 37','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(170,'Test Note 40','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(171,'Test Note 39','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(172,'Test Note 42','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(173,'Test Note 41','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(174,'Test Note 44','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(175,'Test Note 43','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(176,'Test Note 45','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(177,'Test Note 46','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(178,'Test Note 47','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(179,'Test Note 48','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(180,'Test Note 49','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(181,'Test Note 50','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(182,'Test Note 52','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(183,'Test Note 51','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(184,'Test Note 53','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(185,'Test Note 54','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(186,'Test Note 55','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(187,'Test Note 56','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(188,'Test Note 58','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(189,'Test Note 57','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(190,'Test Note 59','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(191,'Test Note 60','test.jpg','AI summary could not be generated from image.',NULL,NULL),
(192,'arduino','test setup.png','Here\'s a summary of the image:\n\n**Overall Scene:** The image shows a laptop displaying a data visualization - likely a graph or chart - sitting on a desk by a window.\n\n**Key Elements:**\n\n*   **Laptop:** A silver laptop is the central focus, displaying a graph. The screen is showing a series of colored bars, which probably represent data.\n*   **Arduino and Wires:** To the left of the laptop is a small Arduino board connected to some wires, suggesting it\'s part of a project that is gathering or displaying data.\n*   **Desk and Background:** The desk is a neutral color, with a notebook and a white circular object (likely a mug) on it. Outside the window, there’s a suburban landscape with houses and greenery.\n\n**In essence, it appears someone is working on a project involving data collection, likely using an Arduino, and visualizing the results on the laptop.** \n\nDo you want me to focus on a particular aspect of the image or provide more detail about the elements shown?',NULL,NULL);
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `cognito_id` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'lin','$2b$10$inTrkmlrAePseDmxYHtVQupVdKkvZRTK7hfj1kVUMhomaY6zFrZUS',1,'2025-08-28 02:45:22','2025-08-28 02:45:22'),
(2,'u1','$2b$10$VCGY3WJ9Z8mKKwIYxnMqTugQ8GLWCiFT/4FnblP3DednpTh/DjqvS',1,'2025-08-28 05:02:34','2025-08-28 05:02:34'),
(3,'admin2','$2b$10$o0XKWNZ155ULGS37WFbu7Osw.i5z.OB6hnyzCinT/wWr4lkI/4uzq',1,'2025-08-29 01:13:04','2025-08-29 01:13:04'),
(4,'lin-student','$2b$10$9FqIEcjq5NPc613rGkjFV.gTM2NLSbE7Ny9B2ynAvGQDnRQ1fDPNu',0,'2025-08-29 01:35:59','2025-08-29 01:35:59'),
(5,'for3','$2b$10$Mtvp5LhJ1gd8XRBc64sD5.QDsBOa6eUS0vrpYV9/ouKx4FDolsoPK',1,'2025-08-29 01:39:22','2025-08-29 01:39:22'),
(6,'u0','$2b$10$Foe.s4TqXKLZzoumfPfq5uh/FGUlof5x1ORWHduYCYA0v.Wkzc3/6',0,'2025-08-30 09:34:53','2025-08-30 09:34:53');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-14 11:37:36
