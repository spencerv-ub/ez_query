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

function empty_container_in_place(container_name) {
    container_to_empty = document.getElementById(container_name)
    container_to_empty.childNodes.forEach(node => {node.remove()})
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

function validate_check(self) {
    self.value = self.checked
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
                    empty_container_in_place("form_query_input")
                    empty_container_in_place("box_output")
                    build_bind_form(response['binds'])
                }
            },
            error: function(error) {error_handler(error)}
        })
}

function build_bind_form(bind_list) {
    var binds = bind_list
    form_input = document.getElementById("form_query_input")

    var options = generate_options()

    if (binds.length != 0) {
        for(const bind_name of binds) {
            bind_input_container = document.createElement('div')
            bind_input_container.classList.add('form_query_input_field_container')
        
            bind_input_field = document.createElement('input')
            bind_input_field.id = bind_name
            bind_input_field.name = bind_name
            
            bind_input_label = document.createElement('label')
            bind_input_label.setAttribute('for', bind_name)

            bind_name_text = bind_name

            if (options['clean_bind_names'] == 'true') {
                bind_name_text = clean_data_header(bind_name)
            } 

            bind_input_label.innerText = bind_name_text + ": "
        
            bind_input_container.appendChild(bind_input_field)
            bind_input_container.appendChild(bind_input_label)
        
            form_input.appendChild(bind_input_container)
        }
    } else {
        form_input_null = document.createElement('div')
        form_input_null.innerText = 'Query has no binds.'
        form_input_null.classList.add('form_query_input_null_container')
        form_input.appendChild(form_input_null)
    }
}

function generate_options() {
    var checkboxes = document.querySelectorAll('input[type=checkbox]')
    
    checkboxes.forEach(self => {
        validate_check(self)
    })

    var form_fields = document.getElementById("form_query_options")
    var options = Object.values(form_fields).reduce((obj, field) => {if (field.name) obj[field.name] = field.value; return obj}, {})

    return options
}

function process_run_query() {
    var submission = Object()
    var form_fields = document.getElementById("form_query_input")
    var binds = Object.values(form_fields).reduce((obj, field) => {if (field.name) obj[field.name] = field.value; return obj}, {})
    
    var options = generate_options()
    
    submission['binds'] = binds
    submission['options'] = options
    submission['manifest_key'] = document.querySelector('input[name="query_choice"]:checked').value;
    $.ajax({
            url: '/process_run_query',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(submission),
            success: function (response) {
                empty_container("box_output")
                build_table(response)
            },
            error: function(error) {error_handler(error)}
        })
}

function build_table(list_of_objects) {
    var box_output = document.getElementById("box_output")
    var table_container = document.createElement('div')
    var table_body = document.createElement('div')
    table_container.classList.value = 'table_container'
    table_body.classList.value = 'table_body'

    const column_headers = [...new Set(list_of_objects.flatMap((obj) => Object.keys(obj)))]

    var options = generate_options()

    /* Specific query responses/filtering */
    
    const column_translations = {
        'DATABASE' : 'Database',
        'UB_ALRM_IF_TERMNTD' : 'Send alarm if terminated',
        'UB_JOB_VER' : 'Job Version',
        'UB_JOID' : 'Job ID'
    }

    const column_order_overrides = {
        'UB_JOB_NAME' : 'data_field_job_name',
        'UB_PROCESS_NAME' : 'data_field_process_name',
        'PROCESS_NAME' : 'data_field_process_name',
        'JOB_NAME' : 'data_field_job_name',
        'OBJECTID1' : 'data_field_peoplecode_ID_1',
        'OBJECTID2' : 'data_field_peoplecode_ID_2',
        'OBJECTID3' : 'data_field_peoplecode_ID_3',
        'OBJECTID4' : 'data_field_peoplecode_ID_4',
        'OBJECTID5' : 'data_field_peoplecode_ID_5',
        'OBJECTID6' : 'data_field_peoplecode_ID_6',
        'OBJECTID7' : 'data_field_peoplecode_ID_7',
        'OBJECTVALUE1' : 'data_field_peoplecode_value_1',
        'OBJECTVALUE2' : 'data_field_peoplecode_value_2',
        'OBJECTVALUE3' : 'data_field_peoplecode_value_3',
        'OBJECTVALUE4' : 'data_field_peoplecode_value_4',
        'OBJECTVALUE5' : 'data_field_peoplecode_value_5',
        'OBJECTVALUE6' : 'data_field_peoplecode_value_6',
        'OBJECTVALUE7' : 'data_field_peoplecode_value_7',
        'PCTEXT' : 'data_field_peoplecode_pctext'
    }

    list_of_objects.forEach((obj) => {
        const table_row_element = document.createElement('div')
        table_row_element.classList.value = 'table_row';
        column_headers.forEach((header) => {
            const table_row_cell_element = document.createElement('div')
            const table_row_cell_data_element = document.createElement('div')
            const table_row_cell_label_element = document.createElement('div')
            table_row_cell_element.classList.value = 'table_cell';
            table_row_cell_label_element.classList.value = 'table_cell_text';
            table_row_cell_data_element.classList.value = 'table_cell_text';

            var cell_label = header;

            if (header in column_order_overrides && options['allow_sort_overrides'] == 'true') {
                table_row_cell_element.classList.add(column_order_overrides[header]) 
            }

            if (header in column_translations && options['readable_labels'] == 'true') {
                cell_label = column_translations[header];
            }

            if ((options['readable_labels'] == 'true' && !(header in column_translations) && options['attempt_data_cleaning'] == 'true') || (options['readable_labels'] == 'false' && options['attempt_data_cleaning'] == 'true')) {
                cell_label = clean_data_header(header)
            }

            table_row_cell_label_element.textContent = cell_label + ': ';

            cell_data = obj[header]

            if (options['attempt_data_cleaning'] == 'true') {
                cell_data = clean_data_data(header, obj[header])
            }           

            table_row_cell_data_element.textContent = cell_data
            
            table_row_cell_element.appendChild(table_row_cell_label_element)
            table_row_cell_element.appendChild(table_row_cell_data_element)
            table_row_element.appendChild(table_row_cell_element)
        })
        table_body.appendChild(table_row_element)
    })

    table_container.appendChild(table_body)
    box_output.appendChild(table_container)

    box_output.scrollIntoView();
}

function clean_data_header(header_data) {
    new_header = header_data
    new_header = new_header.replace("UB_", "")
    new_header = new_header.replaceAll("_", " ")
    new_header = new_header.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase());

    if (header_data == 'COUNT(*)') {new_header = 'Number of Rows'}

    return new_header
}

function clean_data_data(header, field_data) {

    if (header == 'PCTEXT') {
        field_data = 'Truncated for readability. Re-run query without data cleaning to see full text.'
    }

    return field_data
}

/* Work in progress, backup before card view */
function build_table_original(list_of_objects) {
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