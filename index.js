import express from "express";
import path from "path";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import passportlocal from "passport-local";
let users = [];
const app = express();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.json);
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session);
passport.use(
  new passportlocal.Strategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      const user = users.find((user) => user.email === email);
      if (user === undefinde) {
        return done(null, null, { message: "Incorect email" });
      }
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      }
      done(null, null, { message: "incorect password" });
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  done(
    null,
    users.find((user) => user.id === id)
  );
});
app.get("register", checkNotAuthentication, (req, res) => {
  res.sendFile(path.resolve("views/register.html"));
});
app.post("register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPwd = await bcrypt.hash(password, 10);
  users.push({
    name,
    email,
    password: hashedPwd,
  });
  res.redirect("/login");
});
app.get("/login", checkNotAuthentication, (req, res) => {
  console.log(req.body);
  res.send("send data..");
});
app.post(
  "/login",
  passport.authenticate("local", {
    successFlash: "/",
    failureFlash: "/login",
  })
);
app.use(checkAuthentication);

app.get("/", (req, res) => {
  if (req.checkAuthentication() === false) {
    return res.redirect("/login");
  }
  res.sendFile(path.resolve("views/app.html"));
});
app.get("/loggout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});
function checkAuthentication(req, res, next) {
  if (req.isAutehenticated() === false) {
    return res.redirect("/login");
  }
  next();
}
function checkNotAuthentication(req, res, next) {
  if (req.isAutehenticated() === true) {
    return res.redirect("/login");
  }
  next();
}
app.listen(process.env.PORT, function () {
  console.log("Node server is running..");
});
