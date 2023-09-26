var express=require('express')
var mysql=require('mysql')
var bp=require('body-parser')
var formidable=require('formidable')
var fs=require('fs')
var app=express()
var session=require('client-sessions')
app.set('view engine','ejs')

app.use(express.static('public/')); 

app.use(session({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  }));
  console.log("############");
var con = mysql.createConnection({
    host: "localhost",
    database: "cars",
    user: "root",
    password: "Bmanasa@1971"
  });
  console.log("!!!!!!!!!!!!!!!!!!");
  con.connect(function(err) {
    if (err){
        console.log(err);
        throw err;
    } 
    console.log("Connected!");
  });
  console.log("----------------------------");
app.get('/',function(req,res){
    res.render('Home.ejs');
    console.log("Home_page OK");

});
app.get('/car_owner',function(req,res){
    res.render('user.ejs');
    console.log("car_owner OK");

});

app.get('/Register_form',function(req,res){
    console.log(req.url);
    res.render('Register.ejs');
    console.log("car_owner reg OK");
})
var urlenco=bp.urlencoded({extended:false});
app.post('/register',urlenco,function(req,res){
    var sql = "insert into car_owners (name,mobileno,email,password,Aadhar,licence_no,dateofbirth) values('" + req.body.name + "','" + req.body.mobileno + "','" + req.body.email + "','" + req.body.password +"','" + req.body.Aadhar + "','" + req.body.licence_no + "','" + req.body.dateofbirth+ "');"   
    con.query(sql, function (err, result) {
        if (err){
            console.log(err)
            throw err;
        }
      });
   res.render("co_login.ejs");
   console.log("co_registration db OK");
})

app.get('/co_login',function(req,res){
    res.render("co_login.ejs");
    console.log("co_login OK");
})



app.post('/verify',urlenco,function(req,res){
    console.log(req.body);
    con.query("SELECT id,password FROM car_owners where email='"+req.body.username+"'", function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        if(result[0].password==req.body.pass){
            console.log("TTTTT");
            var coid={
                id: result[0].id
            }
            req.session.coid=coid;
             res.render("add_cars.ejs");
        }else{
            // console.log("FFFF");
            res.send("Incorrect");
        }
        console.log("Verification OK");
      });
})

app.get('/Add_Cars',function(req,res){
   res.render("add_cars.ejs");
    console.log("Add Cars OK");
})
 app.post("/cardb",urlenco,function(req,res){
    var sql = "INSERT INTO temp_cars (car_model,reg_no,owner_id,car_price,car_img)  VALUES ('"+req.body.car_model+"','"+req.body.regno+"','"+req.session.coid.id+"','"+req.body.car_price+"','"+req.body.car_img+"');"
    con.query(sql, function (err, result) {
        if (err){
            console.log(err)
            throw err;
        } 
      });
      console.log('Car db OK');
      res.render("upload_rc.ejs");
 })
app.post("/upload",urlenco,function(req,res){
    
    var form = new formidable.IncomingForm();
       form.parse(req, function (err, fields, files) {
        var oldpath = files.pic.path;
        console.log(oldpath);
        console.log(files.pic.name);
        var newpath = './pic' + files.pic.name;
        console.log(newpath);
        fs.copyFile(oldpath, newpath, function (err) {
            if (err){
              console.log(err);
              throw err;

            }
            res.render('add_cars.ejs');

            res.end();
      });
    });
    console.log("upload OK");
})
app.post("/select",urlenco,function(req,res){
    var reg=req.body.regno;
    var sql='insert into active_cars values('+req.body.userid+','+req.session.coid.id+",'"+req.body.car_model+"','"+req.body.regno+"')"
    var coid={
        id:req.session.coid.id,
        user_id: req.body.userid,
        st_date: req.body.st_date,
        st_time: req.body.st_time,
        en_date: req.body.en_date,
        en_time: req.body.en_time,

    }
    req.session.coid=coid;
    console.log(req.session.coid.st_date);
    console.log(sql);
    console.log(req.session.coid);
    var sql_r="delete from cars where reg_no='"+req.body.regno+"';"
    con.query(sql, function (err, result) {
        if (err){
            console.log(err)
            throw err;
        }
        console.log("active_cars record inserted");
      });
      con.query(sql_r, function (err, result) {
        if (err){
            console.log(err)
            throw err;
        }
        console.log("active_cars record inserted");
      });
    console.log("Select OK")
    res.render("add_cars.ejs");
    
})
app.get("/co_homepage",function(req,res){
    var sql="select * from car_requests wt where "+req.session.coid.id+" in (select owner_id from cars c where wt.car_model=c.car_model);"
    console.log(sql);
    con.query(sql, function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        
       var temp=JSON.parse(JSON.stringify(result));
        
         res.render('co_homepage.ejs',{temp:temp});
         console.log("co_homepage OK");
        console.log(err);
      });
})
app.get("/active",function(req,res){
    var sql="select * from active_cars where co_id="+req.session.coid.id+";"
    con.query(sql, function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        console.log(result)
       var temp=JSON.parse(JSON.stringify(result));
        
         res.render('active.ejs',{temp:temp});
        
      });
      console.log('active OK');
})
app.post('/returned',urlenco,function(req,res){
    var sql="insert into cars (car_model,reg_no,owner_id,car_price,car_img)values('"+req.body.car_model+"','"+req.body.reg_no+"','"+req.session.coid.id+"','"+req.body.car_price+"','"+req.body.car_img+"');"
    var sql_r="delete from active_cars where reg_no='"+req.body.reg_no+"';"
    con.query(sql, function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        console.log(result)
       var temp=JSON.parse(JSON.stringify(result)); 
        //  res.render('active.ejs',{temp:temp});
      });
      con.query(sql_r, function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        console.log(result)
       var temp=JSON.parse(JSON.stringify(result));
        
        //  res.render('active.ejs',{temp:temp});
        
      });
      var h_sql="insert into history values("+req.session.coid.id+","+req.session.coid.user_id+",'"+req.body.car_model+"','"+req.body.reg_no+"','"+req.session.coid.st_date+"','"+req.session.coid.st_time+"','"+req.session.coid.en_date+"','"+req.session.coid.en_time+"','"+req.body.returned_date+"','"+req.body.returned_time+"');"
      con.query(h_sql, function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        console.log(result)
       var temp=JSON.parse(JSON.stringify(result));
        
        //  res.render('active.ejs',{temp:temp});
        
      });
      res.render("add_cars.ejs")
      res.send("ACTIVE OK")
      console.log("returned ok");
})
app.get("/History",function(req,res){
    var sql="select * from history where owner_id="+req.session.coid.id;
    con.query(sql, function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        
       var temp=JSON.parse(JSON.stringify(result));
        
         res.render('dis_history.ejs',{temp:temp});
        
      });
      console.log("Returned OK");
})
app.get("/Logout",function(req,res){
    req.session.destroy();
    res.render("co_login.ejs");
    console.log("LogOut OK");
})

//##############################################################################################################################
//ADMIN
app.get("/admin",function(req,res){
    res.render("Admin_login.ejs");
})
app.post("/admin_verify",urlenco,function(req,res){
    con.query("SELECT email,password FROM admin where email='"+req.body.username+"'", function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        if(result[0].password==req.body.pass){
            // var admin={
            //     id: result[0].id
            // }
            // req.session.admin=admin;
             res.render("Admin_homepage.ejs");
        }else{
            // console.log("FFFF");
            res.send("Incorrect");
        }
        console.log("Verification OK");
      });
})
app.get("/Licence_req",function(req,res){
    var sql="select * from licence_req";
    con.query(sql, function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        
       var temp=JSON.parse(JSON.stringify(result));
        
         res.render('Admin_Licence_req.ejs',{temp:temp});
        
      });

})
app.post('/Licence_status',urlenco,function(req,res){
    var status=req.body.submit;
    // console.log(status);
    if(status=="yes"){
        var sql="update users set licence='yes' where id="+req.body.user_id+";"
        con.query(sql, function (err, result, fields) {
          console.log("OK");
          if (err){
              console.log(err);
              throw err;
          }        
          //  res.render('active.ejs',{temp:temp});
          
        });
        var sql_r="delete from licence_req where user_id="+req.body.user_id+";"
        con.query(sql_r, function (err, result, fields) {
          console.log("OK");
          if (err){
              console.log(err);
              throw err;
          }        
          //  res.render('active.ejs',{temp:temp});
          
        });

    }
    if(status=='no'){
      var sql="delete from licence_req where user_id="+req.body.user_id+";"
      con.query(sql, function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }        
        //  res.render('active.ejs',{temp:temp});
        
      });
    }
    res.send("License ok");
})
app.get("/RC_req",function(req,res){
    var sql="select * from temp_cars";
    con.query(sql, function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        
       var temp=JSON.parse(JSON.stringify(result));
        
         res.render('Admin_RC_req.ejs',{temp:temp});
        
      });

})
app.post('/RC_status',urlenco,function(req,res){
    var status=req.body.submit;
    // console.log(status);
    if(status=="yes"){
        var sql="insert into cars(car_model,reg_no,owner_id,car_price,car_img) values('"+req.body.car_model+"','"+req.body.reg_no+"','"+req.body.owner_id+"','"+req.body.car_price+"','"+req.body.car_img+"');"
        con.query(sql, function (err, result) {
            if (err){
                console.log(err)
                throw err;
            } 
          });
        var sql_r="delete from temp_cars where req_id="+req.body.req_id+";"
          con.query(sql_r, function (err, result) {
              if (err){
                  console.log(err)
                  throw err;
              } 
            });
    }else if(status=="no"){
        var sql_r="delete from temp_cars where req_id="+req.body.req_id+";"
        con.query(sql_r, function (err, result) {
            if (err){
                console.log(err)
                throw err;
            } 
          });
    }
    res.send("car request approved");
})
app.get("/Admin_Active",function(req,res){
    var sql="select * from active_cars";
    con.query(sql, function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        
       var temp=JSON.parse(JSON.stringify(result));
        
         res.render('Admin_Active_cars.ejs',{temp:temp});
        
      });

});
app.post("/Active_Display",urlenco,function(req,res){
    if(req.body.submit=="Owner Details"){
        var sql="select * from car_owners where id="+req.body.owner_id+";"
        con.query(sql, function (err, result, fields) {
            console.log("OK");
            if (err){
                console.log(err);
                throw err;
            }
            
           var temp=JSON.parse(JSON.stringify(result));
            
             res.render('Admin_Display_Owner.ejs',{temp:temp});
            
          });
    }
    if(req.body.submit=="User Details"){
        var sql="select * from users where id="+req.body.user_id+";"
        con.query(sql, function (err, result, fields) {
            console.log("OK");
            if (err){
                console.log(err);
                throw err;
            }
           
           var temp=JSON.parse(JSON.stringify(result));
           
             res.render('Admin_Display_User.ejs',{temp:temp});
           
          });
    }
})
app.get("/Admin_his",function(req,res){
    var sql="select * from history;"
    con.query(sql, function (err, result, fields) {
        console.log("OK");
        if (err){
            console.log(err);
            throw err;
        }
        
       var temp=JSON.parse(JSON.stringify(result));
        
         res.render('Admin_dis_history.ejs',{temp:temp});
        
      });
      console.log("Returned OK");
})
app.post("/Admin_history_details",urlenco,function(req,res){
    if(req.body.submit=="Owner Details"){
        var sql="select * from car_owners where id="+req.body.owner_id+";"
        con.query(sql, function (err, result, fields) {
            console.log("OK");
            if (err){
                console.log(err);
                throw err;
            }
            
           var temp=JSON.parse(JSON.stringify(result));
            
             res.render('Admin_Display_Owner.ejs',{temp:temp});
            
          });
    }
    if(req.body.submit=="User Details"){
        //res.send("ADitya table");
         var sql="select * from users where id="+req.body.user_id+";"
         con.query(sql, function (err, result, fields) {
             console.log("OK");
             if (err){
                 console.log(err);
                 throw err;
             }
            
            var temp=JSON.parse(JSON.stringify(result));
            
              res.render('Admin_Display_User.ejs',{temp:temp});
            
           });
    }
})
//#########################################################################################################################
//User
app.set('view engine','hbs');
app.get('/user',function(req,res,next){
    res.render('first');
});
app.post('/submit/login',urlenco,function(req,res,next){
  res.render('login');
  req.session.errors=null;
});
app.post('/submit/loginUser',urlenco,function(req,res,next){
  validUser(req,res);
  showCars(req,res);
});
//ERRRRRRRRRRRRRRRRRRRRRRRROR
function showCars(req,res)
{    
  var all_cars={};
  console.log("IN SHOW CARS");
  con.query("SELECT * FROM cars",function(error,rows,fields){
    //console.log("CARS QUERY");
      if(error)
      {
        console.log(error);
        throw error;
      }
     // else
     // {
        //if(rows!=null)
        //{
          //console.log("hello");
          all_cars=JSON.parse(JSON.stringify(rows));
          //req.session.all_cars=all_cars;
          //if(all_cars!=null)
         // {
            //console.log(all_cars[0].car_model);
            console.log("displayed cars");
            res.render('display_cars',{all_cars : all_cars});
          //}
       // }
     // }
  });
}
app.post('/submit/choose',urlenco,function(req,res,next){
  //console.log(req.body.submit);
  var sql="select licence from users where id="+req.session.user.id+";"
  con.query(sql, function (err, result, fields) {
    console.log("OK");
    if (err){
        console.log(err);
        throw err;
    }
   
  
   if(result[0].licence=='no'){
     res.render('upload_lic');
     //res.end();
   }else{
    var mod={
      car:req.body.submit
    }
    req.session.model=mod;
   res.render('enterDetails');
   
   }
   
  });
  
  //req.session.user.id
});
app.post('/submit/details',urlenco,function(req,res,next){
  enter_bookings(req,res);
});   

function enter_bookings(req,res)
{
  var sql="insert into car_requests (user_id,car_model,pickup_time,pickUp_date,drop_date,drop_time) values ('" + req.session.user.id + "','" + req.body.car_model + "','" + req.body.pickup_time + "','" + req.body.pickUp_date + "','" + req.body.drop_date + "','"+req.body.drop_time+"' );"
 // var sql="insert into car_requests(pickUp_date,pickup_time,drop_date,drop_time,user_id) values ('"+req.body.pickup_date+"','"+req.body.pickup_time+"','"+req.body.drop_date+"','"+req.body.drop_time+"','"+ req.session.user.id +"');"
  //console.log("hello");
  //console.log(req.session.user.id);
  console.log(sql);
  con.query(sql, function (error, rows, fields) {
    if (error) {
      console.log(error);
      throw error
    }
    else {
      console.log("done")
      res.render('layout2', { title: 'Data Saved', body: 'Data saved Successfully' })
    }
  })
  


}


function validUser(req,res)
{
  console.log("In valid user");
  var f=1;
  var email=req.body.email;
  var password=req.body.password;
  con.query("SELECT * FROM users WHERE email = ? ",[email],function(error,rows,fields){
    if(error)
    {
      console.log(error);
    }
    else
    {
      if(rows.length>0)
      {
        if(rows[0].password==password)
        {
          var user={
            id:rows[0].id,
            email:req.body.email
          }
          req.session.user=user;
          //res.render('layout2',{title: 'welcome user',body:'logged in succesfully'});
        }
        else
        {
          res.render('layout2',{title: 'welcome user',body:'email and password did not match'});
        }
      }
      else
      {
        res.render('layout2',{title: 'welcome user',body:'email does not exists'});
      }
    }
  });
}

app.post('/submit/signUp',urlenco, function (req, res, next) {
  res.render('index', { title: 'Form Validation'/*, success: req.session.success, errors: req.session.errors*/ });
  req.session.errors = null;
});
app.post('/submit/signUpUser',urlenco, function (req, res) {
  //check validity
  console.log("submit entered")
 
    insertIntoDB(req,res);
    res.render('login');
    //req.session.success = true;
  

  //res.redirect('/');
});
app.post('/upload_lic',urlenco, function (req, res) {
  var form = new formidable.IncomingForm();
       form.parse(req, function (err, fields, files) {
        var oldpath = files.pic.path;
        console.log(oldpath);
        console.log(files.pic.name);
        var newpath1= './pic' + files.pic.name;
       console.log(newpath1);
        fs.copyFile(oldpath, newpath1,function (err) {
            if (err){console.log(err);
            throw err;} 
            res.render('enterDetails');
           // res.send("Upload success");
            //res.end();
      });
    });
    var mysql="insert into licence_req values("+req.session.user.id+",'"+req.session.user.email+"');"
    con.query(mysql, function (error, rows, fields) {
      if (error) {
        console.log(error);
        throw error
      }
      else {
        console.log("done")
        
        //res.render('layout2', { title: 'Data Saved', body: 'Data saved Successfully' })
      }
    })
 
});

function insertIntoDB(req, res) {
  console.log("insertIntoDB");
  //console.log();
  var sql = "insert into users (name,mobileno,email,password,Aadhar,licence_no,dateofbirth) values('" + req.body.name + "','" + req.body.mobileno + "','" + req.body.email + "','" + req.body.password +"','" + req.body.Aadhar + "','" + req.body.licence_no + "','" + req.body.dateofbirth+ "');"
  console.log(sql);
  con.query(sql, function (error, rows, fields) {
    if (error) {
      console.log(error);
      throw error
    }
    else {
      console.log("done")
      
      //res.render('layout2', { title: 'Data Saved', body: 'Data saved Successfully' })
    }
  });
  
}
app.listen(4000);