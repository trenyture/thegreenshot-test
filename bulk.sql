CREATE DATABASE thegreenshot_test;
USE thegreenshot_test;
SET NAMES utf8mb4;
SET default_storage_engine=INNODB;

CREATE TABLE conversionState (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    label VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE conversionRequest (
    _uuid BINARY(16),
	`uuid` VARCHAR(36) GENERATED ALWAYS AS
		(INSERT(
			INSERT(
				INSERT(
					INSERT(hex(_uuid),9,0,'-'),
				14,0,'-'),
			19,0,'-'),
		24,0,'-')
	) VIRTUAL,
    originalName VARCHAR(180) NOT NULL,
    fkConversionState INT UNSIGNED NOT NULL,
    webhookUrl  VARCHAR(180) NULL,
    createdDate DATETIME NOT NULL DEFAULT UTC_TIMESTAMP(),
    convertedDate DATETIME NULL,
	PRIMARY KEY (_uuid),
    FOREIGN KEY (fkConversionState)
		REFERENCES conversionState (id),
	INDEX createdDateIdx (createdDate),
	INDEX convertedDateIdx (convertedDate)
);

INSERT INTO conversionState (id, label)
VALUES
	(1, "En attente"),
	(2, "En cours"),
	(3, "Terminé"),
	(4, "Erreur");