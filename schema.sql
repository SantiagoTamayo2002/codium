CREATE database codium_db;
USE codium_db;
-- =================================================================
--
--             SCRIPT DE CREACIÓN DE BASE DE DATOS - CODIUM
--
-- =================================================================

-- Deshabilitar la verificación de claves foráneas temporalmente para evitar errores de orden
SET FOREIGN_KEY_CHECKS=0;

-- -----------------------------------------------------
-- Tabla `INSTITUCION`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `INSTITUCION`;
CREATE TABLE `INSTITUCION` (
  `id_institucion`   INT PRIMARY KEY AUTO_INCREMENT,
  `codigo`           VARCHAR(45) NOT NULL UNIQUE,
  `nombre`           VARCHAR(255) NOT NULL,
  `descripcion`      TEXT NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `ROL` (Catálogo)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ROL`;
CREATE TABLE `ROL` (
  `id_rol`     INT PRIMARY KEY AUTO_INCREMENT,
  `nombre_rol` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `PERSONA`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `PERSONA`;
CREATE TABLE `PERSONA` (
  `id_persona`            INT PRIMARY KEY AUTO_INCREMENT,
  `nombre`                VARCHAR(100) NOT NULL,
  `apellidos`             VARCHAR(100) NOT NULL,
  `correo`                VARCHAR(255) NOT NULL UNIQUE,
  `contraseña_hash`       VARCHAR(255) NOT NULL,
  `nombre_usuario`        VARCHAR(50) NOT NULL UNIQUE,
  `num_retos_resueltos`   INT NULL DEFAULT 0,
  `puntaje_total`         INT NULL DEFAULT 0,
  `token_refresco`        VARCHAR(255) NULL,
  `id_rol`                INT NOT NULL,
  FOREIGN KEY (`id_rol`) REFERENCES `ROL` (`id_rol`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `INSTITUCION_PERSONA` (Tabla de Unión)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `INSTITUCION_PERSONA`;
CREATE TABLE `INSTITUCION_PERSONA` (
  `id_institucion`    INT NOT NULL,
  `id_persona`        INT NOT NULL,
  `carrera`           VARCHAR(100) NULL,
  `fecha_inicio`      DATE NULL,
  `fecha_fin`         DATE NULL,
  PRIMARY KEY (`id_institucion`, `id_persona`),
  FOREIGN KEY (`id_institucion`) REFERENCES `INSTITUCION` (`id_institucion`),
  FOREIGN KEY (`id_persona`) REFERENCES `PERSONA` (`id_persona`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `DIFICULTAD` (Catálogo)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `DIFICULTAD`;
CREATE TABLE `DIFICULTAD` (
  `id_dificultad`     INT PRIMARY KEY AUTO_INCREMENT,
  `nombre_dificultad` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `RETO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `RETO`;
CREATE TABLE `RETO` (
  `id_reto`                INT PRIMARY KEY AUTO_INCREMENT,
  `titulo`                 VARCHAR(255) NOT NULL,
  `descripcion`            TEXT NOT NULL,
  `fecha_publicacion`      DATETIME NOT NULL,
  `limite_tiempo_segundos` INT NULL,
  `id_dificultad`          INT NOT NULL,
  FOREIGN KEY (`id_dificultad`) REFERENCES `DIFICULTAD` (`id_dificultad`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `LENGUAJE` (Catálogo)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `LENGUAJE`;
CREATE TABLE `LENGUAJE` (
  `id_lenguaje`     INT PRIMARY KEY AUTO_INCREMENT,
  `nombre_lenguaje` VARCHAR(55) NOT NULL UNIQUE,
  `version`         VARCHAR(20) NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `RETO_LENGUAJE` (Tabla de Unión)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `RETO_LENGUAJE`;
CREATE TABLE `RETO_LENGUAJE` (
  `id_reto` INT NOT NULL,
  `id_lenguaje` INT NOT NULL,
  PRIMARY KEY (`id_reto`, `id_lenguaje`),
  FOREIGN KEY (`id_reto`) REFERENCES `RETO` (`id_reto`),
  FOREIGN KEY (`id_lenguaje`) REFERENCES `LENGUAJE` (`id_lenguaje`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `TEST`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `TEST`;
CREATE TABLE `TEST` (
  `id_test` INT NOT NULL AUTO_INCREMENT,
  `datos_entrada` TEXT NOT NULL,
  `salida_esperada` TEXT NOT NULL,
  `es_publico` BOOLEAN NOT NULL DEFAULT TRUE,
  `id_reto` INT NOT NULL,
  PRIMARY KEY (`id_test`),
  FOREIGN KEY (`id_reto`) REFERENCES `RETO` (`id_reto`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `ESTADO_RESPUESTA` (Catálogo)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ESTADO_RESPUESTA`;
CREATE TABLE `ESTADO_RESPUESTA` (
  `id_estado` INT NOT NULL AUTO_INCREMENT,
  `nombre_estado` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id_estado`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `RESPUESTA`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `RESPUESTA`;
CREATE TABLE `RESPUESTA` (
  `id_respuesta` INT NOT NULL AUTO_INCREMENT,
  `codigo_fuente` TEXT NOT NULL,
  `fecha` DATETIME NOT NULL,
  `puntaje` INT NOT NULL,
  `tiempo_ejecucion_ms` INT NULL,
  `id_persona` INT NOT NULL,
  `id_reto` INT NOT NULL,
  `id_lenguaje` INT NOT NULL,
  `id_estado` INT NOT NULL,
  PRIMARY KEY (`id_respuesta`),
  FOREIGN KEY (`id_persona`) REFERENCES `PERSONA` (`id_persona`),
  FOREIGN KEY (`id_reto`) REFERENCES `RETO` (`id_reto`),
  FOREIGN KEY (`id_lenguaje`) REFERENCES `LENGUAJE` (`id_lenguaje`),
  FOREIGN KEY (`id_estado`) REFERENCES `ESTADO_RESPUESTA` (`id_estado`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `NOTIFICACION`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `NOTIFICACION`;
CREATE TABLE `NOTIFICACION` (
  `id_notificacion` INT NOT NULL AUTO_INCREMENT,
  `contenido` TEXT NOT NULL,
  `hora_envio` DATETIME NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `id_respuesta` INT NOT NULL,
  PRIMARY KEY (`id_notificacion`),
  FOREIGN KEY (`id_respuesta`) REFERENCES `RESPUESTA` (`id_respuesta`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `PUBLICACION`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `PUBLICACION`;
CREATE TABLE `PUBLICACION` (
  `id_publicacion` INT NOT NULL AUTO_INCREMENT,
  `contenido` TEXT NOT NULL,
  `fecha` DATETIME NOT NULL,
  `id_persona` INT NOT NULL,
  PRIMARY KEY (`id_publicacion`),
  FOREIGN KEY (`id_persona`) REFERENCES `PERSONA` (`id_persona`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `COMENTARIO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `COMENTARIO`;
CREATE TABLE `COMENTARIO` (
  `id_comentario` INT NOT NULL AUTO_INCREMENT,
  `contenido` TEXT NOT NULL,
  `fecha` DATETIME NOT NULL,
  `id_publicacion` INT NOT NULL,
  `id_persona` INT NOT NULL,
  `id_comentario_padre` INT NULL,
  PRIMARY KEY (`id_comentario`),
  FOREIGN KEY (`id_publicacion`) REFERENCES `PUBLICACION` (`id_publicacion`),
  FOREIGN KEY (`id_persona`) REFERENCES `PERSONA` (`id_persona`),
  FOREIGN KEY (`id_comentario_padre`) REFERENCES `COMENTARIO` (`id_comentario`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `TIPO_REACCION` (Catálogo)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `TIPO_REACCION`;
CREATE TABLE `TIPO_REACCION` (
  `id_tipo_reaccion` INT NOT NULL AUTO_INCREMENT,
  `nombre_reaccion` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id_tipo_reaccion`)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla `REACCION`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `REACCION`;
CREATE TABLE `REACCION` (
  `id_publicacion` INT NOT NULL,
  `id_persona` INT NOT NULL,
  `id_tipo_reaccion` INT NOT NULL,
  PRIMARY KEY (`id_publicacion`, `id_persona`),
  FOREIGN KEY (`id_publicacion`) REFERENCES `PUBLICACION` (`id_publicacion`),
  FOREIGN KEY (`id_persona`) REFERENCES `PERSONA` (`id_persona`),
  FOREIGN KEY (`id_tipo_reaccion`) REFERENCES `TIPO_REACCION` (`id_tipo_reaccion`)
) ENGINE=InnoDB;

-- Volver a habilitar la verificación de claves foráneas
SET FOREIGN_KEY_CHECKS=1;

-- =================================================================
--        INSERCIÓN DE DATOS INICIALES (CATÁLOGOS)
-- =================================================================

INSERT INTO `ROL` (`nombre_rol`) VALUES ('Administrador'), ('Usuario'), ('Tutor');
INSERT INTO `DIFICULTAD` (`nombre_dificultad`) VALUES ('Fácil'), ('Medio'), ('Difícil');
INSERT INTO `LENGUAJE` (`nombre_lenguaje`, `version`) VALUES ('Python', '3.1X'), ('JavaScript', 'ES6'), ('Java', '11');
INSERT INTO `ESTADO_RESPUESTA` (`nombre_estado`) VALUES ('Aceptado'), ('Rechazado'), ('Error de Compilación'), ('Límite de Tiempo Excedido');
INSERT INTO `TIPO_REACCION` (`nombre_reaccion`) VALUES ('Like'), ('Me encanta'), ('Me asombra'), ('Me divierte');

CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'S@ntiagoñ2002';
GRANT SELECT, INSERT, UPDATE, DELETE ON codium_db.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;

