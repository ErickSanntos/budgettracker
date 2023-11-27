module.exports = function(app, passport, db) {
  const ObjectId = require('mongodb').ObjectId;

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
      // Retrieve the user's budget from the database
      db.collection('users').findOne({ _id: req.user._id }, (err, user) => {
          if (err) return console.log(err);
  
          // Retrieve the user's expenses
          db.collection('expenses').find().toArray((err, expenses) => {
              if (err) return console.log(err);
  
              // Calculate total expenses
              const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  
              // Get the user's budget from the database
              const budget = user ? user.budget : 0; // Default to 0 if user or budget is not found
              const remainingBudget = budget - totalExpenses;
  
              res.render('profile.ejs', {
                  user: req.user,
                  expenses: expenses,
                  totalExpenses: totalExpenses,
                  remainingBudget: remainingBudget,
                  budget: budget // Pass the budget to the template for editing
              });
          });
      });
  });
  
  

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// message board routes ===============================================================

app.post('/addExpense', (req, res) => {
  const category = req.body.category;
  const amount = parseFloat(req.body.amount);

  // Save the new expense to the database
  db.collection('expenses').insertOne({
      category: category,
      amount: amount
  }, (err, result) => {
      if (err) return res.send(err);
      res.redirect('/profile');
  });
});
// Add a new route for editing the budget
app.post('/editBudget', isLoggedIn, function(req, res) {
  const newBudget = parseFloat(req.body.newBudget);

  // Update the user's budget in the database
  db.collection('users').findOneAndUpdate(
      { _id: req.user._id },
      { $set: { budget: newBudget } },
      (err, result) => {
          if (err) return res.send(err);
          res.redirect('/profile');
      }
  );
});


app.delete('/deleteExpense', (req, res) => {
  const expenseId = req.body.expenseId;

  // Delete the expense from the database using the received expenseId
  db.collection('expenses').deleteOne({
      _id: ObjectId(expenseId) // Assuming you are using MongoDB ObjectId
  }, (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Expense deleted!' });
  });
});


// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
