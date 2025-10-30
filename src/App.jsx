import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Button,
  Form,
  Alert,
  Row,
  Col,
  Navbar,
} from "react-bootstrap";

const API = import.meta.env.VITE_API_URL; // Example: http://localhost:5000 or your Render URL

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [loginMsg, setLoginMsg] = useState("");
  const [cartMsg, setCartMsg] = useState("");

  // 🟢 Login handler
  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${API}/api/login`,
        { username, password },
        { withCredentials: true }
      );
      setLoginMsg(res.data.message);
      setIsLoggedIn(true);
      setCartMsg(""); // clear old cart messages
      fetchProducts();
    } catch (err) {
      setLoginMsg(err.response?.data?.message || "Login failed");
    }
  };

  // 🟢 Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/api/products`, {
        withCredentials: true,
      });
      setProducts(res.data);
    } catch {
      setIsLoggedIn(false);
    }
  };

  // 🟢 Add to cart
  const addToCart = async (id) => {
    try {
      const res = await axios.post(
        `${API}/api/cart`,
        { productId: id },
        { withCredentials: true }
      );
      setCartMsg(res.data.message);
    } catch {
      setCartMsg("Session expired. Please log in again.");
      setIsLoggedIn(false);
    }
  };

  // 🟢 Logout
  const logout = async () => {
    await axios.post(`${API}/api/logout`, {}, { withCredentials: true });
    setIsLoggedIn(false);
    setProducts([]);
    setLoginMsg("");
    setCartMsg("");
  };

  // 🕐 Auto-clear cart message after 3 seconds
  useEffect(() => {
    if (cartMsg) {
      const timer = setTimeout(() => setCartMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [cartMsg]);

  // 🕐 Auto-fetch products when logged in
  useEffect(() => {
    if (isLoggedIn) fetchProducts();
  }, [isLoggedIn]);

  return (
    <Container className="py-5">
      {!isLoggedIn ? (
        // 🔵 LOGIN VIEW
        <Card className="mx-auto shadow" style={{ maxWidth: "22rem" }}>
          <Card.Body>
            <Card.Title className="text-center mb-3">Login</Card.Title>
            <Form>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" className="w-100" onClick={handleLogin}>
                Login
              </Button>

              {loginMsg && (
                <Alert
                  variant={loginMsg.toLowerCase().includes("success") ? "success" : "danger"}
                  className="mt-3 text-center"
                >
                  {loginMsg}
                </Alert>
              )}
            </Form>
          </Card.Body>
        </Card>
      ) : (
        // 🟢 PRODUCTS VIEW
        <>
          <Navbar bg="dark" variant="dark" className="mb-4 px-3 rounded">
            <Navbar.Brand>Sensor Products</Navbar.Brand>
            <Button variant="outline-light" onClick={logout}>
              Logout
            </Button>
          </Navbar>

          <Row className="g-4">
            {products.map((p) => (
              <Col md={4} key={p.id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{p.name}</Card.Title>
                    <Card.Text>{p.desc}</Card.Text>
                    <Card.Text className="fw-bold">{p.price}</Card.Text>
                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={() => addToCart(p.id)}
                    >
                      Add to Cart
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {cartMsg && (
            <Alert variant="info" className="mt-4 text-center">
              {cartMsg}
            </Alert>
          )}
        </>
      )}
    </Container>
  );
}

export default App;
