
DROP TABLE if exists gyomu_status_info;

DROP TABLE if exists gyomu_status_handler;

DROP TABLE if exists gyomu_apps_info_cdtbl;

DROP TABLE if exists gyomu_status_type_cdtbl;

DROP TABLE if exists gyomu_market_holiday;

DROP TABLE IF EXISTS gyomu_milestone_daily;

DROP TABLE IF EXISTS gyomu_variable_parameter;


DROP TABLE if exists gyomu_param_master;

DROP TABLE if exists gyomu_task_data_log;

DROP TABLE if exists gyomu_task_data_status;


DROP TABLE if exists gyomu_task_instance_submit_information;


DROP TABLE if exists gyomu_task_instance;

DROP TABLE if exists gyomu_task_data;


DROP TABLE if exists gyomu_task_info_access_list;


DROP TABLE if exists gyomu_task_info_cdtbl;

DROP TABLE if exists gyomu_service_cdtbl;

DROP TABLE if exists gyomu_service_type_cdtbl;

DROP TABLE if exists gyomu_task_scheduler_config;


CREATE TABLE gyomu_apps_info_cdtbl(
	application_id smallint PRIMARY KEY ,
	description varchar(50) NULL,
	mail_from_address varchar(200) NULL,
	mail_from_name varchar(200) NULL
);

CREATE TABLE gyomu_status_type_cdtbl(
	status_type SMALLINT PRIMARY KEY,
	description varchar(15) NULL
);

INSERT INTO gyomu_status_type_cdtbl VALUES (0,'INFO');
INSERT INTO gyomu_status_type_cdtbl VALUES (1,'WARNING');
INSERT INTO gyomu_status_type_cdtbl VALUES (2,'ERROR_BUSINESS');
INSERT INTO gyomu_status_type_cdtbl VALUES (8,'ERROR_DEVEL');

CREATE TABLE gyomu_status_handler(
	id int PRIMARY KEY AUTO_INCREMENT,
	application_id smallint NOT NULL,
	region varchar(3) NULL,
	status_type SMALLINT NULL,
	recipient_address varchar(200) NULL,
	recipient_type varchar(3) NULL
);

CREATE TABLE gyomu_status_info(
	application_id smallint NOT NULL,
	entry_date DATETIME UNIQUE NOT NULL DEFAULT CURRENT_TIMESTAMP ,
	id bigint UNIQUE AUTO_INCREMENT,
	entry_author varchar(30) NOT NULL,
	status_type SMALLINT NOT NULL,
	error_id smallint NOT NULL,
	instance_id int NOT NULL,
	hostname varchar(50) NULL,
	summary varchar(400) NULL,
	description varchar(1000) NULL,
	developer_info text NULL
);


CREATE INDEX IX_gyomu_status_info ON gyomu_status_info
(
	id ASC
);


CREATE TABLE gyomu_market_holiday(
	market varchar(10) NOT NULL,
	year smallint NOT NULL,
	holiday char(8) NOT NULL,
 PRIMARY KEY (market,	holiday )
);

CREATE INDEX IX_gyomu_market_holiday ON gyomu_market_holiday
(market ASC,year ASC);


CREATE TABLE gyomu_milestone_daily(
	target_date varchar(8) NOT NULL,
	milestone_id varchar(200) NOT NULL,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  ,
 PRIMARY KEY (target_date,	milestone_id )
);

CREATE  INDEX IX_gyomu_milestone_daily ON gyomu_milestone_daily
(
	milestone_id
);

CREATE TABLE gyomu_variable_parameter(
	variable_key varchar(20) PRIMARY KEY ,
	description varchar(200) NOT NULL);

INSERT INTO gyomu_variable_parameter VALUES('BBOM','Business Day of Beginning Of Month');
INSERT INTO gyomu_variable_parameter VALUES('BBOY','Business Day of Beginning Of Year');
INSERT INTO gyomu_variable_parameter VALUES('BOM','Beginning of Month');
INSERT INTO gyomu_variable_parameter VALUES('BOY','Beginning of Year');
INSERT INTO gyomu_variable_parameter VALUES('BEOM','Business Day of End Of Month');
INSERT INTO gyomu_variable_parameter VALUES('BEOY','Business Day of End Of Year');
INSERT INTO gyomu_variable_parameter VALUES('EOM','End of Month');
INSERT INTO gyomu_variable_parameter VALUES('EOY','End Day of Year');
INSERT INTO gyomu_variable_parameter VALUES('NEXTBBOM','Business Day of Next Beginning Of Month');
INSERT INTO gyomu_variable_parameter VALUES('NEXTBUS','Previous Business Day');
INSERT INTO gyomu_variable_parameter VALUES('NEXTDAY','Next Day');
INSERT INTO gyomu_variable_parameter VALUES('NEXTBEOM','Business Day of Next End Of Month');
INSERT INTO gyomu_variable_parameter VALUES('PARAMMASTER','From param_master');
INSERT INTO gyomu_variable_parameter VALUES('PREVBUS','Previous Business Day');
INSERT INTO gyomu_variable_parameter VALUES('PREVDAY','Previous Day');
INSERT INTO gyomu_variable_parameter VALUES('PREVBEOM',' Business Day of Previous End Of Month');
INSERT INTO gyomu_variable_parameter VALUES('TODAY','Today');

CREATE TABLE gyomu_param_master(
	item_key varchar(50) NOT NULL,
	item_value text NOT NULL,
	item_fromdate varchar(8) NOT NULL default '',
 PRIMARY KEY (item_key,	item_fromdate )
);


CREATE TABLE gyomu_task_info_cdtbl(
	application_id smallint NOT NULL,
	task_id smallint NOT NULL,
	description varchar(100) NOT NULL,
	language varchar(10) NOT NULL,
	location text NOT NULL,
	class_name varchar(100) NOT NULL,
	restartable boolean NOT NULL,
 PRIMARY KEY (application_id,	task_id )
);

CREATE TABLE gyomu_task_info_access_list(
	application_id smallint NOT NULL,
	task_info_id smallint NOT NULL,
	account_name varchar(100) NOT NULL,	
    UNIQUE CX_gyomu_task_info_access_list (application_id ASC, task_info_id ASC,account_name ASC),

	id bigint UNIQUE AUTO_INCREMENT,
	can_access boolean NOT NULL,
	forbidden boolean NOT NULL
);

CREATE TABLE gyomu_task_data(
	application_id smallint NOT NULL,
	task_info_id smallint NOT NULL,
	entry_date DATETIME UNIQUE NOT NULL DEFAULT CURRENT_TIMESTAMP ,
	id bigint UNIQUE AUTO_INCREMENT,
	entry_author varchar(30) NOT NULL,
	parent_task_data_id bigint NULL,
	parameter text NULL
);


CREATE INDEX IX_gyomu_task_data ON gyomu_task_data
(
	id ASC
);

CREATE INDEX IX_gyomu_task_data1 ON gyomu_task_data
(
	application_id ASC
) ;

CREATE INDEX IX_gyomu_task_data2 ON gyomu_task_data
(
	task_info_id ASC
) ;

CREATE INDEX IX_gyomu_task_data3 ON gyomu_task_data
(
	entry_author ASC
) ;




CREATE TABLE gyomu_task_instance(
	task_data_id bigint NOT NULL,
	entry_date DATETIME UNIQUE NOT NULL DEFAULT CURRENT_TIMESTAMP  ,
	id bigint UNIQUE AUTO_INCREMENT,
	entry_author varchar(30) NOT NULL,
	task_status varchar(10) NULL,
	is_done boolean NOT NULL,
	status_info_id bigint NULL,
	parameter text NULL,
	comment text NULL
);


CREATE INDEX IX_gyomu_task_instance ON gyomu_task_instance
(
	id ASC
);


CREATE INDEX IX_gyomu_task_instance1 ON gyomu_task_instance
(
	task_data_id ASC
) ;

CREATE INDEX IX_gyomu_task_instance2 ON gyomu_task_instance
(
	task_status ASC
) ;



CREATE TABLE gyomu_task_instance_submit_information(
	task_instance_id bigint NOT NULL,
	submit_to varchar(30) NULL,
	UNIQUE CX_gyomu_task_instance_submit_information ( task_instance_id, submit_to),
	id bigint UNIQUE AUTO_INCREMENT
);

CREATE TABLE gyomu_task_data_status(
	task_data_id bigint PRIMARY KEY,
	task_status varchar(10) NULL,
	latest_update_date DATETIME NOT NULL  ,
	latest_task_instance_id bigint NOT NULL
);




CREATE TABLE gyomu_task_data_log(
	task_data_id bigint NOT NULL,
	log_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,    
	UNIQUE CX_gyomu_task_data_log ( task_data_id ASC, log_time ASC ),    
	id bigint UNIQUE AUTO_INCREMENT,
	log text NOT NULL
) ;

CREATE INDEX IX_gyomu_task_data_log ON gyomu_task_data_log
(
	id ASC
);


CREATE TABLE gyomu_service_type_cdtbl(
	id smallint PRIMARY KEY,
	description varchar(100) NOT NULL,
	assembly_name varchar(100) NULL,
	class_name varchar(100) NULL
);

CREATE TABLE gyomu_service_cdtbl(
	id smallint PRIMARY KEY,
	description varchar(100) NOT NULL,
	service_type_id smallint NOT NULL,
	parameter text NULL
);

CREATE TABLE gyomu_task_scheduler_config(
	id bigint PRIMARY KEY AUTO_INCREMENT,
	service_id smallint NOT NULL,
	description varchar(200) NOT NULL,
	application_id smallint NOT NULL,
	task_id smallint NOT NULL,
	monitor_parameter text NOT NULL,
	next_trigger_time DATETIME NOT NULL,
	task_parameter text NULL,
	is_enabled boolean NOT NULL
);

CREATE INDEX IX_gyomu_task_scheduler_config on gyomu_task_scheduler_config
(
	description
);

CREATE INDEX IX_gyomu_task_scheduler_config2 on gyomu_task_scheduler_config
(service_id)
;

CREATE INDEX IX_gyomu_task_scheduler_config3 on gyomu_task_scheduler_config
(application_id,task_id)
;

CREATE INDEX IX_gyomu_task_scheduler_config4 on gyomu_task_scheduler_config
(is_enabled)
;