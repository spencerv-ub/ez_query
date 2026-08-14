function ExecPython(pythonCommand) {
    var request = new XMLHttpRequest()
    request.open("GET", "/" + pythonCommand, true)
    request.send()
}

function error_handler(error) {
    console.log(error);
    let resp = error.responseText;
    const regex = RegExp('<title>(.+?)<\\\/title>', 'gms')
    re = regex.exec(resp)
    alert(re[1])
}

/*
function FunctionName(){
    ExecPython("whatever you need the function to do") 
}
*/

function process_logout() {
    var submission = ''
    $.ajax({
        url: '/process_logout',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(submission),
        success: function (response) {
            if (response['success_status'] == true) {
                empty_container('main_container')
                load_pane('pane_login', 'main_container')
            }
        }, error: function(error) {error_handler(error)}
    })
}

function process_safety_logout() {
    var submission = ''
    $.ajax({
        url: '/process_logout',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(submission),
        success: function (response) {
            if (response['success_status'] == true) {
                console.log('This message can be ignored. Logout safety successful.')
            }
        }, error: function(error) {error_handler(error)}
    })
}

function process_login() {
    var form_fields = document.getElementById("form_login")
    var submission = Object.values(form_fields).reduce((obj, field) => {if (field.name) obj[field.name] = field.value; return obj}, {})
    $.ajax({
            url: '/process_login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(submission),
            success: function (response) {
                unload_pane('pane_login')
                $.get( '/htmx_load_control', function( data ) {
                    $( "#main_container" ).html( $("#main_container").html() + data );
                });
            },
            error: function(error) {error_handler(error)}
        })
}

function htmx_process_logout() {
    var submission = ''
    $.ajax({
        url: '/htmx_process_logout',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(submission),
        success: function (response) {
            if (response['success_status'] == true) {
                empty_container('main_container')
                load_pane('pane_login', 'main_container')
            }
        }, error: function(error) {error_handler(error)}
    })
}

function process_search() {
    var form_fields = document.getElementById("form_search")
    var submission = Object.values(form_fields).reduce((obj, field) => {if (field.name) obj[field.name] = field.value; return obj}, {})

    $.ajax({
        url: '/process_search',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(submission),
        success: function (response) {
            if (response['success_status'] == true) {
                for(const peoplecode_entry_to_compare of response['search_result_1']) {
                    key_structure = peoplecode_entry_to_compare['RESERVED_FOR_EXPORT_PEOPLECODE_KEY'].split("||")

                    form_select = document.getElementById("form_select")
                    
                    radio_button_label = document.createElement('label')
                    radio_button_label.setAttribute('for',peoplecode_entry_to_compare['RESERVED_FOR_EXPORT_UUID'])  

                    radio_button_button = document.createElement('input')
                    radio_button_button.value = peoplecode_entry_to_compare['HASH_SIGNATURE'] + '||' + peoplecode_entry_to_compare['COMPANION_HASH']
                    radio_button_button.id = peoplecode_entry_to_compare['RESERVED_FOR_EXPORT_UUID']
                    radio_button_button.name = 'compare_value'
                    radio_button_button.type = 'radio'
                    radio_button_button.setAttribute('onChange', "select_peoplecode(this)") 
                    
                    radio_button_container = document.createElement('div')
                    radio_button_container.innerText = peoplecode_entry_to_compare['RESERVED_FOR_EXPORT_EASYNAME']

                    radio_button_container.appendChild(radio_button_button)
                    radio_button_label.appendChild(radio_button_container)
                    form_select.appendChild(radio_button_label)
                }
                // document.getElementById("compare_container").innerHTML = response['result']
            }
        }, error: function(error) {error_handler(error)}
    })
}


/* Defunct */
/*
function form_to_object(form_name) {
    var form_elements = document.getElementById(form_name).elements
    var submission = new Object()
    //Safest practice for accessing form data with JS
    //var db1_name = document.getElementById("form_name").elements["field_name"].value

    //Put into for loop to pull all named data
    for (const [key, value] of Object.entries(form_elements)) {
        if (value.name) {
            submission[value.name] = value.value
        }
    }

    return submission
}
*/

function load_pane(pane_name, pane_container) {
    $.get( '/'+pane_name, function( data ) {
        $( "#"+pane_container ).html( $("#"+pane_container).html() + data );
    });
    return true
}

function empty_container(container_name) {
    container_to_empty = document.getElementById(container_name)
    container_parent = container_to_empty.parentNode
    replacement = document.createElement(container_to_empty.nodeName)
    container_to_empty.remove()
    replacement.id = container_name
    container_parent.appendChild(replacement)
}

function show_pane(pane_name) {
    document.getElementById(pane_name).style.removeProperty('display')
}

function unload_pane(pane_name) {
    document.getElementById(pane_name).remove()
}

function select_peoplecode(self) {
    var hashes = self.value.split("||")

    process_compare_select(hashes[0], hashes[1])
}

function load_binds(self) {
    var manifest_key = self.value;
    var submission = Object()
    submission['manifest_key'] = manifest_key
    $.ajax({
            url: '/get_manifest_binds_by_key',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(submission),
            success: function (response) {
                if (response['success_status'] == true) {
                    empty_container("form_query_input")
                    build_bind_form(response['binds'])
                }
            },
            error: function(error) {error_handler(error)}
        })
}

function build_bind_form(bind_list) {
    var binds = bind_list
    form_input = document.getElementById("form_query_input")
    for(const bind_name of binds) {
        bind_input_container = document.createElement('div')
        bind_input_container.classList.add('form_query_input_field_container')
        
        bind_input_field = document.createElement('input')
        bind_input_field.id = bind_name
        bind_input_field.name = bind_name
        
        bind_input_label = document.createElement('label')
        bind_input_label.setAttribute('for', bind_name)
        bind_input_label.innerText = bind_name + ": "
        
        bind_input_container.appendChild(bind_input_field)
        bind_input_container.appendChild(bind_input_label)
        
        form_input.appendChild(bind_input_container)
    }
}

function process_run_query() {
    var submission = Object()
    var form_fields = document.getElementById("form_query_input")
    var binds = Object.values(form_fields).reduce((obj, field) => {if (field.name) obj[field.name] = field.value; return obj}, {})
    submission['binds'] = binds
    submission['manifest_key'] = document.querySelector('input[name="query_choice"]:checked').value;
    $.ajax({
            url: '/process_run_query',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(submission),
            success: function (response) {
                empty_container("pane_output")
                build_table(response)
            },
            error: function(error) {error_handler(error)}
        })
}

function build_table(list_of_objects) {
    var pane_output = document.getElementById("pane_output")
    var table = document.createElement('table')
    var table_head = document.createElement('thead')
    var table_body = document.createElement('tbody')

    const column_headers = [...new Set(list_of_objects.flatMap((obj) => Object.keys(obj)))]

    column_headers.forEach((header) => {
        const table_header_element = document.createElement('th')
        table_header_element.textContent = header
        table_head.appendChild(table_header_element)
    })

    list_of_objects.forEach((obj) => {
        const table_row_element = document.createElement('tr')
        column_headers.forEach((header) => {
            const table_row_cell_element = document.createElement('td')
            table_row_cell_element.textContent = obj[header]
            table_row_element.appendChild(table_row_cell_element)
        })
        table_body.appendChild(table_row_element)
    })

    table.appendChild(table_head)
    table.appendChild(table_body)
    pane_output.appendChild(table)
}

function process_compare_select(object_one_hash, object_two_hash) {
    var submission = Object()
    submission['object_one_hash'] = object_one_hash
    submission['object_two_hash'] = object_two_hash
    submission['db1_connection_name'] = db1_connection_name
    submission['db2_connection_name'] = db2_connection_name

    $.ajax({
            url: '/process_compare_select',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(submission),
            success: function (response) {
                if (response['success_status'] == true) {
                    document.getElementById('pane_compare').innerHTML = response['result']
                }
            },
            error: function(error) {error_handler(error)}
        })
}

