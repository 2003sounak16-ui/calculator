package com.github.sounak.calculator;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.Map;

public class CalculatorServer {
    private static final Map<String, String> MIME_TYPES = new HashMap<>();

    static {
        MIME_TYPES.put(".html", "text/html; charset=utf-8");
        MIME_TYPES.put(".css", "text/css; charset=utf-8");
        MIME_TYPES.put(".js", "text/javascript; charset=utf-8");
        MIME_TYPES.put(".json", "application/json; charset=utf-8");
        MIME_TYPES.put(".png", "image/png");
        MIME_TYPES.put(".jpg", "image/jpeg");
        MIME_TYPES.put(".jpeg", "image/jpeg");
        MIME_TYPES.put(".svg", "image/svg+xml");
        MIME_TYPES.put(".ico", "image/x-icon");
        MIME_TYPES.put(".txt", "text/plain; charset=utf-8");
    }

    public static void main(String[] args) throws IOException {
        int port = 3000;
        String portEnv = System.getenv("PORT");
        if (portEnv != null && !portEnv.trim().isEmpty()) {
            try {
                port = Integer.parseInt(portEnv.trim());
            } catch (NumberFormatException ignored) {}
        }

        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
        server.createContext("/", new StaticHandler());
        server.setExecutor(null);

        System.out.println("Calculator Server listening on 0.0.0.0:" + port);
        server.start();
    }

    static class StaticHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();

            // Health check endpoint
            if ("/health".equals(path) || "/healthz".equals(path)) {
                byte[] ok = "UP".getBytes();
                exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
                exchange.sendResponseHeaders(200, ok.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(ok);
                }
                return;
            }

            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            // Look inside META-INF/resources first (standard WebJar location)
            String resourcePath = "/META-INF/resources" + (path.startsWith("/") ? path : "/" + path);
            InputStream is = CalculatorServer.class.getResourceAsStream(resourcePath);

            // Fallback to classpath root
            if (is == null) {
                is = CalculatorServer.class.getResourceAsStream(path.startsWith("/") ? path : "/" + path);
            }

            if (is == null) {
                byte[] notFound = "404 Not Found".getBytes();
                exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
                exchange.sendResponseHeaders(404, notFound.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(notFound);
                }
                return;
            }

            String contentType = "application/octet-stream";
            int dot = path.lastIndexOf('.');
            if (dot != -1) {
                String ext = path.substring(dot).toLowerCase();
                contentType = MIME_TYPES.getOrDefault(ext, "application/octet-stream");
            }

            byte[] bytes = is.readAllBytes();
            is.close();

            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }
}
