//sign in sample:
//if user has signed in give prompt, otherwise go to index page
$(function () {
    var client = window.skypeWebApp

    if(window.skypeWebApp.signInManager.state()=="SignedIn") {
        $('.content').html('<div class="signed-in">You have signed in.</div>');
    }

    // when the user clicks on the "Sign In" button
    $('#btn-sign-in').click(function () {
        // start signing in
        $(".modal").show();
        client.signInManager.signIn({
            username: $('#txt-username').val(),
            password: $('#txt-password').val()
        }).then(function () {
            // when the sign in operation succeeds display the user name
            $(".modal").hide();
            console.log('Signed in as ' + client.personsAndGroupsManager.mePerson.displayName());
            $(".menu #sign-in").click();
            $("#anonymous-join").addClass("disable");
        }, function (error) {
            // if something goes wrong in either of the steps above,
            // display the error message
            $(".modal").hide();
            alert("Can't sign in, please check the user name and password.");
            window.location.reload();
            console.log(error || 'Cannot sign in');
        });
    });

    $('#txt-username, #txt-password').keypress(function(evt){
      if(evt.keyCode == 13) {
        $("#btn-sign-in").click();
      } 
    });

    $("#btn-token-sign-in").click(function(){
      $(".modal").show();
      var domain = $("#txt-domain").val();
      var access_token = $("#txt-token").val();

      var Bearercwt='Bearer cwt=';
      var Bearer='Bearer ';
      var cwt='cwt';

      if(access_token.indexOf(cwt)==-1) {
        access_token=Bearercwt+access_token;
      }

      if (access_token.indexOf(Bearer)==-1) {
        access_token=Bearer+access_token; 
      }

      var options = {
          auth: function (req, send) {
              req.headers['Authorization'] = access_token.trim();
              return send(req);
          },
          domain: domain
      };
      client.signInManager.signIn(options).then(function () {
        $(".modal").hide();
        console.log('Signed in as ' + client.personsAndGroupsManager.mePerson.displayName());
        $("#anonymous-join").addClass("disable");
        $(".menu #sign-in").click();
      });
    });

    $(".topology-login").click(function(){
      $(".login-options").hide();
      $(".token-sign-in").hide();
      $(".sign-in").show();
    });

    $(".token-login").click(function(){
      $(".login-options").hide();
      $(".sign-in").hide();
      $(".token-sign-in").show();
    });

});
