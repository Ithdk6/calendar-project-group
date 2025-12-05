DROP TABLE if EXISTS Users;
DROP TABLE IF EXISTS EventCore;
DROP TABLE IF EXISTS EventTime;
DROP TABLE if EXISTS Groups;
DROP TABLE if EXISTS Calendar;
DROP TABLE if EXISTS Availability;
DROP TABLE if EXISTS Display;
DROP TABLE if EXISTS Type;
DROP TABLE if EXISTS Included;
DROP TABLE if EXISTS EventAdd;
DROP TABLE if EXISTS GCal;
DROP TABLE if EXISTS Has;
DROP TABLE if EXISTS EventType;

CREATE TABLE Users(
  Uid INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(255) NOT NULL,
  pass VARCHAR(255) NOT NULL
);

CREATE TABLE Groups(
  Gid INTEGER PRIMARY KEY AUTOINCREMENT,
  Gname VARCHAR(255) NOT NULL,
  constraint unique_groupname unique (Gname)
);

CREATE TABLE Calendar(
  Cid INTEGER PRIMARY KEY AUTOINCREMENT,
  Cname VARCHAR(255) NOT NULL
);

CREATE TABLE EventCore(
  Eid INTEGER PRIMARY KEY AUTOINCREMENT,
  Title VARCHAR(255) NOT NULL,
  Description TEXT
);

--descriptor table for event via splitting the original event table into a core and a time table
CREATE TABLE EventTime(
  EventID INTEGER PRIMARY KEY,
  StartTime VARCHAR(255) not NULL,
  EndTime VARCHAR(255) not NULL,
  Day INTEGER Not NULL,
  Month INTEGER Not NULL,
  EYear INTEGER Not NULL
);

CREATE TABLE Type(
  Tid Integer PRIMARY KEY AUTOINCREMENT,
  Tname VARCHAR(255) NOT NULL,
  constraint unique_typename unique (Tname)
);

CREATE TABLE Availability(
  Aid INTEGER PRIMARY KEY AUTOINCREMENT,
  Day INTEGER Not NULL,
  Month INTEGER Not NULL,
  AYear INTEGER Not NULL,
  StartTime VARCHAR(255) NOT NULL,
  EndTime VARCHAR(255) Not NULL
);

--mapping table for calendar and group
CREATE table GCal(
  CalendarID INTEGER,
  GroupID INTEGER,
  PRIMARY key (CalendarID, GroupID)
);

--mapping table for group and user
CREATE Table Included(
  UserID INTEGER,
  GroupID INTEGER,
  PRIMARY key (UserID, GroupID)
);

--mapping table for Type and Event
CREATE table EventType(
  TypeID INTEGER,
  EventID INTEGER,
  PRIMARY key (EventID, TypeID)
);

--mapping table for calendar and event
CREATE table EventAdd(
  CalendarID INTEGER,
  EventID INTEGER,
  PRIMARY key (EventID, CalendarID)
);

--mapping table for User and Availability
CREATE table Has(
  UserID INTEGER,
  AvailID INTEGER,
  PRIMARY key (UserID, AvailID)
);
