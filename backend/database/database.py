import sqlite3

conn = sqlite3.connext('sqlite.db') #create db file if it is not created already

cursor = conn.cursor() #used to execute SQL queries and fetch results