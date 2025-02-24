require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sql, poolPromise } = require("./db");
const { swaggerUI, swaggerSpec } = require("./swagger");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: "Ugyldig token" });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: "Ingen tilgang, ingen token" });
  }
};

app.post("/auth/refresh", authenticateJWT, async (req, res) => {
  try {
    const user = req.user;
    const newToken = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token: newToken });
  } catch (error) {
    res.status(500).json({ error: "Kunne ikke fornye token" });
  }
});

// EMAIL SETUP 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/send-email", async (req, res) => {
  const { name, phone, email, subject, message } = req.body;
  if (!name || !phone || !email || !subject || !message) {
    return res.status(400).json({ error: "Alle feltene må fylles ut." });
  }
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: "Din bestilling er bekreftet!",
    text: "Takk for din bestilling. Vi behandler den nå!",
  };
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Email failed to send." });
  }
});

// COMPONENTS API        
app.get("/Components", async (req, res) => {
  try {
    const { id, search, type } = req.query;
    let query = "SELECT * FROM Components WHERE 1=1";

    const pool = await poolPromise;
    const request = pool.request();

    if (id) {
      query += " AND ID = @id";
      request.input("id", sql.Int, id);
    }
    if (search) {
      query += " AND (Type LIKE @search OR Name LIKE @search)";
      request.input("search", sql.NVarChar, `%${search}%`);
    }
    if (type && type !== "*") {
      query += " AND Type = @type";
      request.input("type", sql.NVarChar, type);
    }

    console.log("Executing query:", query);
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Feil ved henting av komponenter:", error);
    res.status(500).json({ error: "Kunne ikke hente komponenter." });
  }
});

//  HANDLEKURV API       
app.get("/cart", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("userId", sql.Int, userId);
    const query = `
      SELECT sc.Id, sc.ComponentId, sc.Quantity, c.Name, c.Price
      FROM ShoppingCart sc
      JOIN Components c ON sc.ComponentId = c.Id
      WHERE sc.UserId = @userId
    `;
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/cart/add", authenticateJWT, async (req, res) => {
  try {
    const { componentId, quantity } = req.body;
    if (!componentId) {
      return res.status(400).json({ error: "ComponentId er påkrevd" });
    }
    const qty = quantity || 1;
    const userId = req.user.id;
    const pool = await poolPromise;
    const stockRequest = pool.request();
    stockRequest.input("componentId", sql.Int, componentId);
    const stockResult = await stockRequest.query(
      "SELECT inStock FROM Components WHERE ID = @componentId"
    );
    if (stockResult.recordset.length === 0) {
      return res.status(404).json({ error: "Komponenten finnes ikke" });
    }
    const inStock = stockResult.recordset[0].inStock;
    if (inStock < qty) {
      return res.status(400).json({ error: "Ikke nok varer på lager" });
    }
    const checkRequest = pool.request();
    checkRequest.input("userId", sql.Int, userId);
    checkRequest.input("componentId", sql.Int, componentId);
    const checkResult = await checkRequest.query( "SELECT * FROM ShoppingCart WHERE UserId = @userId AND ComponentId = @componentId" );
    if (checkResult.recordset.length > 0) {
      const updateRequest = pool.request();
      updateRequest.input("userId", sql.Int, userId);
      updateRequest.input("componentId", sql.Int, componentId);
      updateRequest.input("quantity", sql.Int, qty);
      await updateRequest.query(
        "UPDATE ShoppingCart SET Quantity = Quantity + @quantity WHERE UserId = @userId AND ComponentId = @componentId"
      );
    } else {
      const insertRequest = pool.request();
      insertRequest.input("userId", sql.Int, userId);
      insertRequest.input("componentId", sql.Int, componentId);
      insertRequest.input("quantity", sql.Int, qty);
      await insertRequest.query(
        "INSERT INTO ShoppingCart (UserId, ComponentId, Quantity) VALUES (@userId, @componentId, @quantity)"
      );
    }
    const updateStockRequest = pool.request();
    updateStockRequest.input("componentId", sql.Int, componentId);
    updateStockRequest.input("quantity", sql.Int, qty);
    await updateStockRequest.query(
      "UPDATE Components SET inStock = inStock - @quantity WHERE ID = @componentId"
    );
    res.json({ message: "Vare lagt til i handlekurven, og lageret er oppdatert" });
  } catch (error) {
    console.error("❌ Feil ved /cart/add:", error);
    res.status(500).json({ error: "Kunne ikke legge til i handlekurven" });
  }
});

app.delete('/cart/remove', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { componentId } = req.query; 

  if (!componentId) {
    return res.status(400).json({ error: "ComponentId er påkrevd." });
  }
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("userId", sql.Int, userId);
    request.input("componentId", sql.Int, componentId);
    const checkQuery = "SELECT Quantity FROM ShoppingCart WHERE UserId = @userId AND ComponentId = @componentId";
    const checkResult = await request.query(checkQuery);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: "Varen finnes ikke i handlekurven." });
    }
    const quantityInCart = checkResult.recordset[0].Quantity;
    if (quantityInCart > 1) {
      await request.query("UPDATE ShoppingCart SET Quantity = Quantity - 1 WHERE UserId = @userId AND ComponentId = @componentId");
      const updateStockRequest = pool.request();
      updateStockRequest.input("componentId", sql.Int, componentId);
      await updateStockRequest.query("UPDATE Components SET inStock = inStock + 1 WHERE ID = @componentId");
    } else {
      await request.query("DELETE FROM ShoppingCart WHERE UserId = @userId AND ComponentId = @componentId");
      const updateStockRequest = pool.request();
      updateStockRequest.input("componentId", sql.Int, componentId);
      await updateStockRequest.query("UPDATE Components SET inStock = inStock + 1 WHERE ID = @componentId");
    }
    res.json({ message: "Vare fjernet fra handlekurven og lager oppdatert!" });
  } catch (error) {
    console.error("Feil ved fjerning av vare:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/cart/clear', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const pool = await poolPromise;
    const getCartQuery = "SELECT ComponentId, Quantity FROM ShoppingCart WHERE UserId = @userId";
    const cartItems = await pool.request().input("userId", sql.Int, userId).query(getCartQuery);

    if (cartItems.recordset.length === 0) {
      return res.status(404).json({ error: "Handlekurven er allerede tom." });
    }
    for (const item of cartItems.recordset) {
      const updateStockRequest = pool.request();
      updateStockRequest.input("componentId", sql.Int, item.ComponentId);
      updateStockRequest.input("quantity", sql.Int, item.Quantity);
      await updateStockRequest.query("UPDATE Components SET inStock = inStock + @quantity WHERE ID = @componentId");
    }
    await pool.request().input("userId", sql.Int, userId).query("DELETE FROM ShoppingCart WHERE UserId = @userId");
    res.json({ message: "Handlekurven er tømt, og lageret er oppdatert." });
  } catch (error) {
    console.error("Feil ved tømming av handlekurv:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/cart/checkout", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await poolPromise;
    const userResult = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT Email FROM Users WHERE Id = @userId");
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: "Bruker ikke funnet." });
    }
    const userEmail = userResult.recordset[0].Email;
    const cartResult = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT sc.ComponentId, sc.Quantity, c.Name, c.Price
        FROM ShoppingCart sc
        JOIN Components c ON sc.ComponentId = c.Id
        WHERE sc.UserId = @userId
      `);
    const cartItems = cartResult.recordset;
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Handlekurven er tom." });
    }
    let totalPrice = 0;
    let orderDetails = cartItems
      .map((item) => {
        const itemTotal = item.Price * item.Quantity;
        totalPrice += itemTotal;
        return `${item.Name} (x${item.Quantity}) - $${itemTotal.toFixed(2)}`;
      })
      .join("\n");

    // Lag e-postmelding
    const emailText = `
      Hei,

      Takk for din bestilling hos The HW Shop! 🎉
      
      Her er ordredetaljene dine:

      ${orderDetails}

      Totalsum: $${totalPrice.toFixed(2)}

      Vi behandler nå bestillingen din, og du vil motta en oppdatering når den er sendt.

      Med vennlig hilsen,
      The HW Shop
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: "Bekreftelse på din bestilling hos The HW Shop",
      text: emailText,
    };
    await transporter.sendMail(mailOptions);
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("DELETE FROM ShoppingCart WHERE UserId = @userId");
    res.json({ message: "Checkout fullført! E-post sendt." });
  } catch (error) {
    console.error("Feil ved checkout:", error);
    res.status(500).json({ error: "Serverfeil ved checkout." });
  }
});

// Auth funksjonalitet
app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).send("Brukernavn, e-post og passord er påkrevd");
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;
    const request = pool.request();
    request.input("username", sql.NVarChar, username);
    request.input("password", sql.NVarChar, hashedPassword);
    request.input("email", sql.NVarChar, email);
    await request.query("INSERT INTO Users (Username, Email, PasswordHash) VALUES (@username, @email, @password)");
    res.send("Bruker registrert!");
  } catch (error) {
    res.status(500).send("Feil ved registrering: " + error.message);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Brukernavn og passord er påkrevd");
  }
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("username", sql.NVarChar, username);
    const result = await request.query("SELECT * FROM Users WHERE Username = @username");
    if (result.recordset.length === 0) {
      return res.status(401).send("Feil brukernavn eller passord");
    }
    const user = result.recordset[0];
    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!passwordMatch) {
      return res.status(401).send("Feil brukernavn eller passord");
    }
    const token = jwt.sign({ id: user.Id, username: user.Username, isAdmin: user.IsAdmin }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).send("Feil ved innlogging: " + error.message);
  }
});


// Admin Funkslonalitet
app.get('/admin/users', authenticateJWT, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: "Ikke autorisert" });
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT Id, Username, Email, IsAdmin FROM Users");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/admin/users', authenticateJWT, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: "Ikke autorisert" });
    const { username, email, password, isAdmin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;
    const request = pool.request();
    request.input("username", sql.NVarChar, username);
    request.input("email", sql.NVarChar, email);
    request.input("password", sql.NVarChar, hashedPassword);
    request.input("isAdmin", sql.Bit, isAdmin);
    await request.query("INSERT INTO Users (Username, Email, PasswordHash, IsAdmin) VALUES (@username, @email, @password, @isAdmin)");
    res.json({ message: "Bruker lagt til!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/admin/users/:id", async (req, res) => {
  const { Id, Username, Email, IsAdmin } = req.body;
  if (!Username || !Email) {
    return res.status(400).json({ error: "Brukernavn og e-post er påkrevd." });
  }
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const userId = parseInt(Id);
    request.input("Id", sql.Int, userId);
    request.input("Username", sql.NVarChar, Username);
    request.input("Email", sql.NVarChar, Email);
    request.input("IsAdmin", sql.Bit, IsAdmin);
    const result = await request.query(`
      UPDATE Users SET Username = @Username, Email = @Email, IsAdmin = @IsAdmin WHERE Id = @Id
    `);
    res.json({ success: true, message: "Bruker oppdatert!" });
  } catch (error) {
    console.error("❌ Feil ved oppdatering av bruker:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/admin/users/:id', authenticateJWT, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: "Ikke autorisert" });
    const userId = req.params.id;
    const pool = await poolPromise;
    const request = pool.request();
    request.input("userId", sql.Int, userId);
    await request.query("DELETE FROM Users WHERE Id = @userId");
    res.json({ message: "Bruker slettet!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/admin/products', authenticateJWT, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: "Ikke autorisert" });
    const pool = await poolPromise;
    const result = await pool.request().query(
      "SELECT Id AS Id, Name, Type, Price, inStock FROM Components"
    );
    res.json(result.recordset);
  } catch (error) {
    console.error("Feil ved henting av produkter:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/admin/products', authenticateJWT, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: "Ikke autorisert" });
    const { name, type, price, inStock } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input("name", sql.NVarChar, name);
    request.input("type", sql.NVarChar, type);
    request.input("price", sql.Decimal, price);
    request.input("inStock", sql.Int, inStock);
    await request.query("INSERT INTO Components (Name, Type, Price, inStock) VALUES (@name, @type, @price, @inStock)");
    res.json({ message: "Produkt lagt til!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/admin/products/:id', authenticateJWT, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Ikke autorisert" });
    }
    const productId = req.params.id;
    const { Name, Type, Price, inStock } = req.body;
    if (!productId || !Name || !Type || Price === undefined || inStock === undefined) {
      console.error("❌ Feil: En eller flere felter mangler", req.body);
      return res.status(400).json({ error: "Alle felter er påkrevd" });
    }
    const pool = await poolPromise;
    const request = pool.request();
    request.input("productId", sql.Int, productId);
    request.input("name", sql.NVarChar, Name);
    request.input("type", sql.NVarChar, Type);
    request.input("price", sql.Decimal, Price);
    request.input("inStock", sql.Int, inStock);
    const result = await request.query(
      "UPDATE Components SET Name = @name, Type = @type, Price = @price, inStock = @inStock WHERE Id = @productId"
    );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Produkt ikke funnet" });
    }
    res.json({ message: "Produkt oppdatert!" });
  } catch (error) {
    console.error("❌ Feil ved oppdatering av produkt:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/admin/products/:id', authenticateJWT, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ error: "Ikke autorisert" });
    const productId = req.params.id;
    const pool = await poolPromise;
    const request = pool.request();
    request.input("productId", sql.Int, productId);
    await request.query("DELETE FROM Components WHERE Id = @productId");
    res.json({ message: "Produkt slettet!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/admin/create", async (req, res) => {
  const { username, email, password, isAdmin } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Alle feltene er påkrevd." });
  }
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("username", sql.NVarChar, username);
    request.input("email", sql.NVarChar, email);
    const checkUser = await request.query("SELECT * FROM Users WHERE Username = @username OR Email = @email");
    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ error: "Brukernavn eller e-post er allerede i bruk." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    request.input("passwordHash", sql.NVarChar, hashedPassword);
    request.input("isAdmin", sql.Bit, isAdmin ? 1 : 0);
    await request.query(
      "INSERT INTO Users (Username, Email, PasswordHash, IsAdmin) VALUES (@username, @email, @passwordHash, @isAdmin)"
    );
    res.status(201).json({ message: "Admin opprettet!" });
  } catch (error) {
    console.error("Feil ved oppretting av admin:", error);
    res.status(500).json({ error: "Noe gikk galt ved oppretting av admin." });
  }
});

module.exports = { app };
