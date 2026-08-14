import oracledb
from oracledb import exceptions
import difflib
import pathlib, os
import re
import json

import ub_utility, ub_easy_utils, ub_debug

from functools import wraps
from dotenv import find_dotenv, dotenv_values

hidden_values = dotenv_values(find_dotenv())

ub_utility.debug = True

if ub_utility.debug:
    import ub_debug as ub_debug
    for i in ub_debug.get_imported_ub_modules():
        ub_debug.debug_decorate_functions(module=i, decoration=ub_debug.debug_measure_speed)

CONFIG = {
    'oracle_config_location' : f'C:{os.sep}oracle{os.sep}product{os.sep}12.2.0{os.sep}client_1{os.sep}network{os.sep}admin',
    'db_ignore' : ['stg', 'dmo']
}

oracledb.init_oracle_client(config_dir=CONFIG['oracle_config_location'])

oracledb.defaults.fetch_lobs = False

# -----

def process_login(submission: dict):
    result = login_handler(
        db_name = submission['db_name'],
        db_username = submission['db_username'],
        db_password = submission['db_password']
    )
    return result, True

def login_handler(db_name: str, db_username: str, db_password: str):
    db_connection = ub_utility.build_database_connection(username=db_username, password=db_password, database=db_name)
    database_connections = (db_connection,)
    return database_connections

def process_logout(database_connections: tuple):
    for connection in database_connections: 
        try:
            connection.close() 
        except oracledb.InterfaceError as e:
            ub_debug.log('warning',f'Tried to close connection that does not exist. - {e}')
    return True, True

def test_db_connection(u_name: str, db: str, p_word: str):
    try:
        connection = oracledb.connect(
                        user=f'{u_name}',
                        password=f'{p_word}',
                        dsn=f"cs{db}eas.buffalo.edu")
        bool_connect = True

        cursor = connection.cursor()
        cursor.execute('ALTER SESSION SET current_schema=SYSADM')

        bool_init = True
        if (bool_init and bool_connect):
            query = cursor.execute('select * from pspcmtxt where objectvalue1 = \'UB_SV_COMPARE_DUMMY\'')
            query = ub_utility.query_to_dict(query_cursor=query)
            connection.close()
            return query
        else: 
            return False
    except Exception:
        return False

def htmx_get_database_list():
    database_list = []

    if not pathlib.Path(f'{str(CONFIG['oracle_config_location'])}{os.sep}tnsnames.ora').exists():
        ub_debug.log('info','Could not find tnsnames, populating default values.')
        database_list = ['dev','tst','qat','prd']
    else:
        ub_debug.log('info','Found tnsnames, populating values.')
        oracle_config_location = f'{str(CONFIG['oracle_config_location'])}{os.sep}tnsnames.ora'
        with open(oracle_config_location, 'r') as oracle_config:
            potential_db_list = re.findall(r'cs(.*)eas\.buffalo\.edu =', oracle_config.read())
            for i in potential_db_list:
                if i not in CONFIG['db_ignore']:
                    database_list.append(i)

    return database_list

def get_db_name(database_connections: tuple):
    return database_connections[0].connection.db_name.upper()

def _define_manifest():
    manifest = {}

    ub_utility.directory_seatbelt('./queries')

    for i in pathlib.Path('queries').iterdir():
        item_name = i.stem
        item_type = i.suffix
        if item_type.lower() == '.sql':
            item_readable_name = item_name.replace('_', ' ' ).title()
            f = open(i, 'r')
            opened_query = f.read()
            
            REGEX_PATTERNS = [r':(\w+?)$', r':(.+?)\W']

            bind_variables = set()

            for pattern in REGEX_PATTERNS:
                results = ub_easy_utils.easy_regex(opened_query, pattern, True)
                for bind in results:
                    bind_variables.add(bind)

            bind_variables = list(bind_variables)
            manifest[item_name] = {
                'binds': bind_variables,
                'name_readable' : item_readable_name
                }

    json_object = json.dumps(obj=manifest, indent=4)
    with open('manifest.json', 'w') as manifest_file:
        manifest_file.write(json_object)

def read_manifest():
    with open('manifest.json', 'r') as manifest_file:
        manifest_loaded = json.load(fp=manifest_file)
        ub_debug.log('debug', f'Loaded manifest file values: {manifest_loaded}')
        return manifest_loaded

def process_query_run(submission: dict, database_connections: tuple):    
    binds = submission['binds']
    query = submission['manifest_key']

    f = open(f'queries{os.sep}{query}.sql', 'r')
    opened_query = f.read()

    query_cursor = database_connections[0]

    returned = ub_utility.query_to_dict(query_cursor.execute(opened_query, binds))   
    ub_debug.log('debug', returned)
    ub_debug.log('debug', submission)

    return returned