DROP INDEX if exists  [CX_gyomu_status_info] ON [dbo].[gyomu_status_info] WITH ( ONLINE = OFF ) 
GO

DROP TABLE if exists gyomu_status_info;

DROP TABLE if exists gyomu_status_handler;

DROP TABLE if exists gyomu_apps_info_cdtbl;

DROP TABLE if exists gyomu_status_type_cdtbl;

DROP TABLE if exists gyomu_milestone_cdtbl;

DROP TABLE if exists gyomu_market_holiday;

DROP TABLE IF EXISTS gyomu_milestone_daily;
GO

DROP TABLE IF EXISTS gyomu_variable_parameter;
GO

DROP TABLE IF EXISTS gyomu_param_master;
GO


DROP TABLE if exists gyomu_task_data_log;
GO

DROP TABLE if exists gyomu_task_data_status;
GO

DROP TABLE if exists gyomu_task_instance_submit_information;
GO

DROP TABLE if exists gyomu_task_instance;
GO

DROP TABLE if exists gyomu_task_data;
GO

DROP TABLE if exists gyomu_task_info_access_list;
GO

DROP TABLE if exists gyomu_task_info_cdtbl;
GO

DROP TABLE if exists gyomu_service_cdtbl;
GO

DROP TABLE if exists gyomu_service_type_cdtbl;
GO

DROP TABLE if exists gyomu_task_scheduler_config;
GO


CREATE TABLE [dbo].[gyomu_apps_info_cdtbl](
  [id] [uniqueidentifier] NOT NULL,
	[description] [varchar](50) NULL,
	[mail_from_address] [varchar](200) NULL,
	[mail_from_name] [varchar](200) NULL,
 CONSTRAINT [PK_gyomu_apps_info_cdtbl] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE UNIQUE CLUSTERED INDEX CX_gyomu_apps_info_cdtbl ON [dbo].[gyomu_apps_info_cdtbl]
(
  [description] ASC
) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE TABLE [dbo].[gyomu_status_type_cdtbl](
  [id] [uniqueidentifier] NOT NULL,
	[description] [varchar](15) NULL,
 CONSTRAINT [PK_gyomu_status_type_cdtbl] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE UNIQUE CLUSTERED INDEX CX_gyomu_status_type_cdtbl ON [dbo].[gyomu_status_type_cdtbl]
(
  [description] ASC
) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

INSERT INTO [gyomu_status_type_cdtbl] VALUES (NEWID(),'INFO');
INSERT INTO [gyomu_status_type_cdtbl] VALUES (NEWID(),'WARNING');
INSERT INTO [gyomu_status_type_cdtbl] VALUES (NEWID(),'ERROR_BUSINESS');
INSERT INTO [gyomu_status_type_cdtbl] VALUES (NEWID(),'ERROR_DEVEL');

CREATE TABLE [dbo].[gyomu_status_handler](
	[id] [uniqueidentifier] NOT NULL,
	[application_id] [uniqueidentifier] NOT NULL,
	[region] [varchar](3) NULL,
	[status_type_id] [uniqueidentifier] NULL,
	[recipient_address] [varchar](200) NULL,
	[recipient_type] [varchar](3) NULL,
 CONSTRAINT [PK_gyomu_status_handler_cdtbl] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE CLUSTERED INDEX CX_gyomu_status_handler ON [dbo].[gyomu_status_handler]
(
  [application_id] ASC,[status_type_id] ASC, [region] ASC
) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


CREATE TABLE [dbo].[gyomu_status_info](
	[id] [uniqueidentifier]  NOT NULL,
	[application_id] [uniqueidentifier] NOT NULL,
	[modified_at] datetimeoffset(3) NOT NULL,
	[modified_by] [varchar](100) NOT NULL,
	[status_type_id] [uniqueidentifier] NOT NULL,
  error_id smallint NOT NULL,
	[instance_id] [int] NOT NULL,
	[host_name] [varchar](50) NULL,
	[summary] [nvarchar](400) NULL,
	[description] [nvarchar](1000) NULL,
	[developer_info] ntext NULL,
 CONSTRAINT [PK_gyomu_status_info] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


CREATE CLUSTERED INDEX [CX_gyomu_status_info] ON [dbo].[gyomu_status_info]
(
	[modified_at] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO




CREATE TABLE [dbo].[gyomu_market_holiday](
	[id] [uniqueidentifier]  NOT NULL,
	[market] [varchar](10) NOT NULL,
	year smallint NOT NULL,
	holiday char(10) NOT NULL,
 CONSTRAINT [PK_gyomu_market_holiday] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE UNIQUE CLUSTERED INDEX [CX_gyomu_market_holiday] ON [dbo].[gyomu_market_holiday]
(
	[market] ASC,
	[holiday] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


CREATE INDEX IX_gyomu_market_holiday ON gyomu_market_holiday
(market ASC,year ASC)
GO

CREATE TABLE [dbo].[gyomu_milestone_cdtbl](
	[id] [uniqueidentifier]  NOT NULL,  
	[milestone_id] varchar(200) NOT NULL,
	[description] nvarchar(1000) NOT NULL,
	 CONSTRAINT [PK_gyomu_milestone_cdtbl] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
)

CREATE UNIQUE CLUSTERED INDEX [CX_gyomu_milestone_cdtbl] ON [dbo].[gyomu_milestone_cdtbl]
(
	[milestone_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE TABLE [dbo].[gyomu_milestone_daily](
	[id] [uniqueidentifier]  NOT NULL,
  [target_type] [varchar](10) NOT NULL, --- 'daily' | 'monthly'  
	[target_date] CHAR(10) NOT NULL,
  [target_ym] CHAR(7) NOT NULL, --- 'YYYY-MM'
	[milestone_id] varchar(200) NOT NULL,
	[modified_at] datetimeoffset(3) NOT NULL,
	[modified_by] [varchar](100) NOT NULL,
 CONSTRAINT [PK_gyomu_milestone_daily] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE UNIQUE CLUSTERED INDEX [CX_gyomu_milestone_daily] ON [dbo].[gyomu_milestone_daily]
(
	[target_date] ASC,[target_type] ASC, [milestone_id]
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE  INDEX IX_gyomu_milestone_daily ON gyomu_milestone_daily
(
	milestone_id
)
GO

CREATE  INDEX IX_gyomu_milestone_daily2 ON gyomu_milestone_daily
(
	[target_type] ASC, [target_ym] ASC, [milestone_id] ASC
)
GO

CREATE TABLE [dbo].[gyomu_variable_parameter](
  	[id] [uniqueidentifier]  NOT NULL,  
	variable_key varchar(20) NOT NULL,
	description varchar(200) NOT NULL,
 CONSTRAINT [PK_gyomu_variable_parameter] PRIMARY KEY NONCLUSTERED 
(
	id
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE UNIQUE CLUSTERED INDEX [CX_gyomu_variable_parameter] ON [dbo].[gyomu_variable_parameter]
(
	variable_key ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'BBOM','Business Day of Beginning Of Month');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'BBOY','Business Day of Beginning Of Year');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'BOM','Beginning of Month');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'BOY','Beginning of Year');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'BEOM','Business Day of End Of Month');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'BEOY','Business Day of End Of Year');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'EOM','End of Month');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'EOY','End Day of Year');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'NEXTBBOM','Business Day of Next Beginning Of Month');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'NEXTBUS','Previous Business Day');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'NEXTDAY','Next Day');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'NEXTBEOM','Business Day of Next End Of Month');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'PARAMMASTER','From param_master');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'PREVBUS','Previous Business Day');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'PREVDAY','Previous Day');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'PREVBEOM',' Business Day of Previous End Of Month');
INSERT INTO gyomu_variable_parameter VALUES(NEWID(),'TODAY','Today');
GO


CREATE TABLE [dbo].[gyomu_param_master](
 	[id] [uniqueidentifier]  NOT NULL,  
	[item_key] [varchar](50) NOT NULL,
	[item_value] ntext NOT NULL,
	[item_fromdate] [varchar](10) NOT NULL default ''
 CONSTRAINT [PK_gyomu_param_master] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE UNIQUE CLUSTERED INDEX [CX_gyomu_param_master] ON [dbo].[gyomu_param_master]
(
	[item_key] ASC,[item_fromdate] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


CREATE TABLE [dbo].[gyomu_task_info_cdtbl](
 	[id] [uniqueidentifier]  NOT NULL,  
	[application_id] [uniqueidentifier] NOT NULL,
	[description] [varchar](100) NOT NULL,
	[language] [varchar](10) NOT NULL,
	[location] [text] NOT NULL,
	[class_name] [varchar](100) NOT NULL,
	[restartable] [bit] NOT NULL,
 CONSTRAINT [PK_gyomu_task_info_cdtbl] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
CREATE UNIQUE CLUSTERED INDEX [CX_gyomu_task_info_cdtbl] ON [dbo].[gyomu_task_info_cdtbl]
(
	[application_id] ASC,
	[description] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE TABLE [dbo].[gyomu_task_info_access_list](
 	[id] [uniqueidentifier]  NOT NULL, 
	[application_id] [uniqueidentifier] NOT NULL,
	[task_info_id] [uniqueidentifier] NOT NULL,
	[account_name] [varchar](100) NOT NULL,
	[can_access] [bit] NOT NULL,
	[forbidden] [bit] NOT NULL,
 CONSTRAINT [PK_gyomu_task_info_access_list] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC

)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE CLUSTERED INDEX [CX_gyomu_task_info_access_list] ON [dbo].[gyomu_task_info_access_list]
(
	[application_id] ASC,
	[task_info_id] ASC,
	[account_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


CREATE TABLE [dbo].[gyomu_task_data](
 	[id] [uniqueidentifier]  NOT NULL, 
	[application_id] [uniqueidentifier] NOT NULL,
	[task_info_id] [uniqueidentifier] NOT NULL,
	[modified_at] datetimeoffset(3) NOT NULL,
	[modified_by] [varchar](100) NOT NULL,
	[parent_task_data_id] [uniqueidentifier] NULL,
	[parameter] ntext NULL,
 CONSTRAINT [PK_gyomu_task_data] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC

)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE CLUSTERED INDEX [CX_gyomu_task_data] ON [dbo].[gyomu_task_data]
(
	[modified_at] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE INDEX IX_gyomu_task_data1 ON dbo.gyomu_task_data
(
	application_id ASC
) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE INDEX IX_gyomu_task_data2 ON dbo.gyomu_task_data
(
	task_info_id ASC
) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE INDEX IX_gyomu_task_data3 ON dbo.gyomu_task_data
(
	[modified_by] ASC
) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE TABLE [dbo].[gyomu_task_instance](
 	[id] [uniqueidentifier]  NOT NULL, 
	[task_data_id] [uniqueidentifier] NOT NULL,
	[modified_at] datetimeoffset(3) NOT NULL,
	[modified_by] [varchar](100) NOT NULL,
	[task_status] varchar(10) NULL,
	[is_done] bit NOT NULL,
	[status_info_id] [uniqueidentifier] NULL,
	[parameter] ntext NULL,
	[comment] ntext NULL,
 CONSTRAINT [PK_gyomu_task_instance] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC

)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO




CREATE CLUSTERED INDEX [CX_gyomu_task_instance] ON [dbo].[gyomu_task_instance]
(
	[modified_at] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE INDEX IX_gyomu_task_instance1 ON dbo.[gyomu_task_instance]
(
	task_data_id ASC
) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE INDEX IX_gyomu_task_instance2 ON dbo.[gyomu_task_instance]
(
	task_status ASC
) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO



CREATE TABLE [dbo].[gyomu_task_instance_submit_information](
 	[id] [uniqueidentifier]  NOT NULL, 
	[task_instance_id] [uniqueidentifier] NOT NULL,
	[submit_to] [varchar](30) NULL,
 CONSTRAINT [PK_gyomu_task_instance_submit_information] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC

)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE CLUSTERED INDEX [CX_gyomu_task_instance_submit_information] ON [dbo].[gyomu_task_instance_submit_information]
(
	[task_instance_id] ASC,
	[submit_to] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


CREATE TABLE [dbo].[gyomu_task_data_status](
 	[id] [uniqueidentifier]  NOT NULL, 
	[task_data_id] [uniqueidentifier] NOT NULL,
	[task_status] varchar(10) NULL,
	[modified_at] datetimeoffset(3) NOT NULL,
	[modified_by] [varchar](100) NOT NULL,
	[latest_task_instance_id] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_gyomu_task_data_status] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC

)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE CLUSTERED INDEX [CX_gyomu_task_data_status] ON [dbo].[gyomu_task_data_status]
(
	[task_data_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO



CREATE TABLE [dbo].[gyomu_task_data_log](
 	[id] [uniqueidentifier]  NOT NULL, 
	[task_data_id] [uniqueidentifier] NOT NULL,
	[modified_at] datetimeoffset(3) NOT NULL,
	[modified_by] [varchar](100) NOT NULL,
	[log] [ntext] NOT NULL,
 CONSTRAINT [PK_gyomu_task_data_log] PRIMARY KEY NONCLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE CLUSTERED INDEX [CX_gyomu_task_data_log] ON [dbo].[gyomu_task_data_log]
(
	[task_data_id] ASC,
	[modified_at] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


CREATE TABLE [dbo].[gyomu_service_type_cdtbl](
 	[id] [uniqueidentifier]  NOT NULL,   
	[description] [varchar](100) NOT NULL,
	[assembly_name] [varchar](100) NULL,
	[class_name] [varchar](100) NULL,
 CONSTRAINT [PK_gyomu_service_type_cdtbl] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
CREATE UNIQUE CLUSTERED INDEX [CX_gyomu_service_type_cdtbl] ON [dbo].[gyomu_service_type_cdtbl]
(
	[description] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE TABLE [dbo].[gyomu_service_cdtbl](
 	[id] [uniqueidentifier]  NOT NULL,  
	[description] [varchar](100) NOT NULL,
	[service_type_id] [uniqueidentifier] NOT NULL,
	[parameter] ntext NULL,
 CONSTRAINT [PK_gyomu_server_service_cdtbl] PRIMARY KEY NONCLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
CREATE UNIQUE CLUSTERED INDEX [CX_gyomu_service_cdtbl] ON [dbo].[gyomu_service_cdtbl]
(
	[description] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


CREATE TABLE [dbo].[gyomu_task_scheduler_config](
 	[id] [uniqueidentifier]  NOT NULL,
	service_id uniqueidentifier NOT NULL,
	description varchar(200) NOT NULL,
	application_id uniqueidentifier NOT NULL,
	task_info_id uniqueidentifier NOT NULL,
	monitor_parameter ntext NOT NULL,
	next_trigger_time datetimeoffset(3) NOT NULL,
	task_parameter ntext NULL,
	is_enabled bit NOT NULL,
 CONSTRAINT [PK_gyomu_task_scheduler_config] PRIMARY KEY NONCLUSTERED 
(
	id
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE CLUSTERED INDEX [CX_gyomu_task_scheduler_config] ON [dbo].[gyomu_task_scheduler_config]
(
	[service_id] ASC,[application_id] ASC,[task_info_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE INDEX IX_gyomu_task_scheduler_config on gyomu_task_scheduler_config
(
	description
)

CREATE INDEX IX_gyomu_task_scheduler_config2 on gyomu_task_scheduler_config
(service_id)
go

CREATE INDEX IX_gyomu_task_scheduler_config3 on gyomu_task_scheduler_config
(application_id,task_info_id)
go

CREATE INDEX IX_gyomu_task_scheduler_config4 on gyomu_task_scheduler_config
(is_enabled)
go
