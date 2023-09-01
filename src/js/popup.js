$(function(){
 
    chrome.storage.sync.get('newdomain', function(newdomains){
        if(newdomains.newdomain)
        {
            $("#new_domain").val(newdomains.newdomain.toString());

            chrome.storage.sync.get('Compartments', function(compartment){
                var compartment_array=[];
                compartment_array = compartment.Compartments;
                
                var select = document.getElementById("selected_compartment_to_add_domain");
                var options = select.options;

                options.length = 0; // i added it
                
                for(var index in compartment_array) {
                    options.add( new Option(compartment_array[index].value, index));
                }
            });
        }
    });



    $('#insert_comparment').click(function(){
        chrome.storage.sync.get('Compartments', function(compartment){
            var compartment_array=[];
            var new_compartment_exists = false;
            //The condition check if there is an empty input
            //The for loop will check whether there is an existing compartment
            if($('#new_compartment').val().length != 0){
                for(var elements in compartment.Compartments){
                    if($('#new_compartment').val() == compartment.Compartments[elements].value)
                        new_compartment_exists = true;
                }
                if(!new_compartment_exists){    
                    compartment_array.push({"value":$('#new_compartment').val()}); // the value of "Add Compartment" input (1)
                }
            }
            for(var elements in compartment.Compartments) 
            {
                compartment_array.push({"value":compartment.Compartments[elements].value});
            }
            chrome.storage.sync.set({'Compartments': compartment_array});
            $('#new_compartment').val("");
        });
    });

    $('#new_profile').keyup(function(){
        chrome.storage.sync.get('Compartments', function(compartment){
            var compartment_array=[];
            compartment_array = compartment.Compartments;
            
            var select = document.getElementById("selected_compartment_to_add_profile");
            var options = select.options;

            options.length = 0;

            for(var index in compartment_array) {
                options.add( new Option(compartment_array[index].value, index));
            }
        });
    });


    $('#insert_profile').click(async function(){ // when clicking the button "Add Profile" (5)
        chrome.storage.sync.get('profiles', async function(profile){
            var profile_array=[];
            var compartment_array=[];  
            var new_profile_exists = false;
            var account_exists = false;
            if($('#new_profile').val().length != 0 
            && $('#selected_compartment_to_add_profile').find(':selected').text() !=0
            && $('#private_key').val() !=0 ){
                try{
                    var public_key = await web3.eth.accounts.privateKeyToAccount($('#private_key').val()).address;
                }catch(error){
                    console.log(error);
                }
                for(var i =0; i< App.account.length; i++){
                    if(public_key == App.account[i])
                        account_exists=true;
                }
                if(!account_exists){
                    $('#success').css({'color':'#FF0000'});
                    $('#success').html("Account does not exists!");
                }
                for(var elements in profile.profiles){
                    if((profile.profiles[elements].prof == $('#new_profile').val() 
                        && profile.profiles[elements].compartment == $('#selected_compartment_to_add_profile').find(":selected").text())
                        || (profile.profiles[elements].privateKey == $('#private_key').val())){
                        
                        new_profile_exists = true;
                        $('#success').css({'color':'#FF0000'});
                        $('#success').html("Account or Profile is already used!");
                    }
                }

                if(!new_profile_exists && account_exists){
                    profile_array.push({'prof':$('#new_profile').val(), // the value of "Add Profile" input (3)
                    'compartment': $('#selected_compartment_to_add_profile').find(":selected").text(),
                    'privateKey': $('#private_key').val()
                    // the value of the selected item in the dropbox of "Add Profile" (4)
                    });
                    $('#success').css({'color':'#59981A'});
                    $('#success').html("Profile added successfully");
                    $('#new_profile').val("");
                    $('#private_key').val("");
                }
            }else{
                $('#success').css({'color':'#FF0000'});
                $('#success').html("Please fill all the required fields");
            }
            for(var elements in profile.profiles) 
            {
                profile_array.push({'prof':profile.profiles[elements].prof, 
                'compartment':profile.profiles[elements].compartment,
                'privateKey':profile.profiles[elements].privateKey});
            }
            chrome.storage.sync.set({'profiles': profile_array});
        
        });
    });

    //When writing a new domain, this functions populates the drop down list with the list of existing compartments
    $('#new_domain').keyup(function(){
        chrome.storage.sync.get('Compartments', function(compartment){
            var compartment_array=[];
            compartment_array = compartment.Compartments;
            
            var select = document.getElementById("selected_compartment_to_add_domain");
            var options = select.options;

            options.length = 0; // i added it
            
            for(var index in compartment_array) {
                options.add( new Option(compartment_array[index].value, index));
            }
        });
    });    

    //When creating a new domain and selecting a compartment, this functions populates the drop down list with the list of existing profiles
    $('#selected_compartment_to_add_domain').click(function(){
        chrome.storage.sync.get('profiles', function(profile){
            var profile_array=[];
            profile_array = profile.profiles;
            
            var select = document.getElementById("selected_profile_to_add_domain");
            for (var i = select.options.length-1; i >= 0; i--) {
                select.options[i] = null;
              }
            
            for(var index in profile_array) {
                if(profile_array[index].compartment == $('#selected_compartment_to_add_domain').find(":selected").text())
                {
                    select.options.add( new Option(profile_array[index].prof, index));
                }
                
            }
        });
    });   

    //Create a new domain associated with the selected profile.
    $('#insert_domain').click(function(){
        chrome.storage.sync.get('domains', function(domain){
            var domain_array=[];
            var isFound = false;     

            var new_domain = $('#new_domain').val();
            new_domain = new_domain.replace('https://','');
            new_domain = new_domain.replace('http://','');
            new_domain = new_domain.replace('www.','');

            for(var elements in domain.domains) 
            {
                domain_array.push({'domain':domain.domains[elements].domain, 'prof':domain.domains[elements].prof});
                if(domain.domains[elements].domain == new_domain)
                    isFound = true;
            }

            if(!isFound)
            {
                domain_array.push({
                    'domain':$('#new_domain').val(), 
                    'prof': $('#selected_profile_to_add_domain').find(":selected").text()});    
                    $('#success2').css({'color':'#59981A'});
                    $('#success2').html("Domain added successfully!");
                    $('#new_domain').val("");
            }else{
                $('#success2').css({'color':'#FF0000'});
                $('#success2').html("This domain already exists!");
            }


            chrome.storage.sync.set({'domains': domain_array});
            chrome.storage.sync.set({'newdomain': null});
            $('#new_domain').val("");
        });
    });


    $('#filter_domain').click(function(){
        chrome.storage.sync.get('domains', function(domain){
            var domain_array1=[];
            domain_array1 = domain.domains;
            
            var select = document.getElementById("selected_domain");
            select.options.length = 0;
            
            for(var index in domain_array1) {
                select.options.add( new Option(domain_array1[index].domain, index));
            } 
        });

        document.getElementById("renderList").innerHTML = "";
        var i=0, l = 10000, j = 1000, q = 20000, s = 30000;
        
        var domain_array=[];
        var profile_array2=[];
        var compartment_array1=[];
        chrome.storage.sync.get('domains', function(domain){
            domain_array = domain.domains;
            chrome.storage.sync.get('profiles', function(profile){
                profile_array2 = profile.profiles;
                chrome.storage.sync.get('Compartments', function(compartment){
                    compartment_array1 = compartment.Compartments;
                    for(var index1 in compartment_array1) {
                        var n = '' + l;
                        var ul1 = document.createElement('ul');
                        ul1.setAttribute('id', n);
                        ul1.setAttribute('class','nested');
                        document.getElementById('renderList').appendChild(ul1);
            
                        var k = '' + i;
                        var li1 = document.createElement('li');
                        li1.setAttribute('class','item');
                        li1.setAttribute('id', k);
                        ul1.appendChild(li1);

                        li1.innerHTML=li1.innerHTML + compartment_array1[index1].value;

                        for(var index in profile_array2) {
                            if(compartment_array1[index1].value === profile_array2[index].compartment)
                            {
                                var ul2 = document.createElement('ul');
                                var m = '' + j;
                                ul2.setAttribute('id', m);
                                ul2.setAttribute('class','nested');
                                document.getElementById(k).appendChild(ul2);
                                var r = '' + s;
                                var li2 = document.createElement('li');
                                li2.setAttribute('class','item');
                                li2.setAttribute('id', r);
        
                                ul2.appendChild(li2);
                                li2.innerHTML=li2.innerHTML + profile_array2[index].prof;

                                // 3rd loop
                                for(var index3 in domain_array) {
                                    if(domain_array[index3].prof === profile_array2[index].prof)
                                    {
                                        var ul3 = document.createElement('ul');
                                        var p = '' + q;
                                        ul3.setAttribute('id', p);
                                        ul3.setAttribute('class','nested');
                                        document.getElementById(r).appendChild(ul3);
                                        var li3 = document.createElement('li');
                                        li3.setAttribute('class','item');
                
                                        ul3.appendChild(li3);
                                        li3.innerHTML=li3.innerHTML + domain_array[index3].domain;
                                        q++;
                                    }
                                } 
                                j++;
                                s++;
                            }

                        }
                        l++;
                        i++;
                    }
                });

            });

        });
    });
});