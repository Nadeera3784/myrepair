const fs      = require('fs');

const __root = "plugins/";

const Plugin_interface = {

    async get_all_plugins(){
        let configs = JSON.parse(fs.readFileSync(__root+'default.json', 'utf8'));
        return new Promise(function(resolve, reject) {
            if (configs) {
                resolve(configs);
            }else {
                reject(new Error("Something went wrong please check config file"));
            }
        });
    },
    
    async get_plugin(_plugin_name){

    },
    async update_plugin(_plugin_name){

    },
    async delete_plugin(_plugin_name){

    },
    async is_module_exits(_module_name){
        return new Promise((resolve, reject) => {
            try {
                resolve(require.resolve(_module_name));
            } catch(e) {
                reject(false);
            }
        });
    },

}

module.exports = Plugin_interface;