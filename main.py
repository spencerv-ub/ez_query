from flask import Flask, render_template, request, jsonify
import webbrowser
import oracledb
import difflib
import functions as functions
import ub_utility, ub_easy_utils, ub_debug

from functools import wraps
from dotenv import find_dotenv, dotenv_values

import pathlib

hidden_values = dotenv_values(find_dotenv())

ub_utility.debug = False

ub_debug.LOG_LEVEL = 0

if ub_utility.debug:
    import ub_debug as ub_debug
    for i in ub_debug.get_imported_ub_modules():
        ub_debug.debug_decorate_functions(module=i, decoration=ub_debug.debug_measure_speed)

# -----

ub_debug.LOG_LEVEL = 2

app = Flask(__name__)

database_connections = tuple()

query_options = ['readable_labels', 'allow_sort_overrides', 'attempt_data_cleaning', 'clean_bind_names', 'rationalize_peoplecode_ids']

output_options = ['display_output_as_column']

query_options_dict = {}

output_options_dict = {}

for i in query_options: query_options_dict[i] = i.replace('_', ' ' ).title()

for i in output_options: output_options_dict[i] = i.replace('_', ' ' ).title()

@app.route('/', methods=['GET', 'POST'])
def index(): return render_template('index.html')

@app.route('/process_login', methods=['POST'])
def process_login():
    global database_connections
    submission = request.get_json()

    database_connections, success_status = functions.process_login(submission)

    returned_value = jsonify(result = 'Login success!', success_status = success_status)

    return returned_value

@app.route('/process_logout', methods=['POST'])
def process_logout():
    global database_connections
    submission = request.get_json()
    
    returned_value, success_status = functions.process_logout(database_connections=database_connections)

    returned_value = jsonify(result = returned_value, success_status = success_status)

    return returned_value

@app.route('/process_search', methods=['POST'])
def process_search():
    global database_connections
    submission = request.get_json()
    
    search_result_1, search_result_2, success_status = functions.process_search(database_connections=database_connections, submission=submission)

    returned_value = jsonify(search_result_1 = search_result_1, search_result_2 = search_result_2, success_status = success_status)

    return returned_value

@app.route('/process_compare_select', methods=['POST'])
def process_compare_select():
    global database_connections
    submission = request.get_json()
    
    result, success_status = functions.process_compare_select(database_connections=database_connections, submission=submission)

    returned_value = jsonify(result = result, success_status = success_status)

    return returned_value

@app.route('/get_database_list', methods=['POST'])
def get_database_list():
    global database_connections
    submission = request.get_json()
    
    returned_value, success_status = functions.get_database_list(submission=submission)

    returned_value = jsonify(result = returned_value, success_status = success_status)

    return returned_value

# I call this one the ouroboros.
# Python writing python.
def pane_handler(pane_name: str):
    exec(f"@app.route('/{pane_name}', methods=['GET'])\ndef {pane_name}(): return render_template('{pane_name}.html')")

for i in pathlib.Path('templates').iterdir(): 
    item_name = i.stem
    if item_name.startswith('pane_'): pane_handler(item_name)

'''

@app.route('/pane_login', methods=['GET'])
def pane_login(): return render_template('pane_login.html')

@app.route('/pane_logout', methods=['GET'])
def pane_logout(): return render_template('pane_logout.html')

@app.route('/pane_search', methods=['GET'])
def pane_search(): return render_template('pane_search.html')

'''

#if __name__ == '__main__':
#    webbrowser.open('http://127.0.0.1:5000', new=0)
#    app.run(debug=True)


### HTMX Rework of Flask Backbone

@app.route('/htmx_pane_login', methods=['GET'])
def htmx_pane_login():
    ub_utility.connection_last_call()
    return render_template('pane_login.html', databases = functions.htmx_get_database_list())

@app.route('/htmx_load_control', methods=['GET'])
def htmx_load_logout():
    ub_debug.log('debug', functions.get_db_name(database_connections=database_connections))
    return render_template('pane_control.html', db_connection_name = functions.get_db_name(database_connections=database_connections), options_to_create = functions.read_manifest(), query_options = query_options_dict, output_options = output_options_dict)

@app.route('/htmx_process_logout', methods=['GET'])
def htmx_process_logout():
    ub_utility.connection_last_call()
    return render_template('pane_control.html', db_connection_name = functions.get_db_name(database_connections=database_connections))


@app.route('/get_manifest_binds_by_key', methods=['POST'])
def get_manifest_binds_by_key():
    submission = request.get_json()
    manifest_key = submission['manifest_key']
    binds = manifest[manifest_key]['binds']
    success_status = True

    ub_debug.log('debug', f'Key value: {manifest_key}, returned value: {binds}')

    # Originally added this when all queries had some bind values. Not the case anymore. Removing this.
    #if binds == []: success_status = False

    response = jsonify(success_status = success_status, binds = binds)

    return response

@app.route('/process_run_query', methods=['POST'])
def process_run_query():
    submission = request.get_json()
    response = functions.process_query_run(submission=submission, database_connections = database_connections)
    return response

if __name__ == '__main__':
    global manifest
    from waitress import serve
    functions._define_manifest()
    manifest = functions.read_manifest()
    serve(app, host='localhost', port='5000')