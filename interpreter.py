import sys, os, pathlib
import ub_debug, ub_utility, ub_config_handler
import dotenv
import ub_easy_utils
import json

from playground_connections_saved import *

ub_debug.LOG_LEVEL = 1

def _define_manifest():
    manifest = {}

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
    with open('manifest.json', 'w') as config_file:
        config_file.write(json_object)

if __name__ == '__main__':
    _define_manifest()