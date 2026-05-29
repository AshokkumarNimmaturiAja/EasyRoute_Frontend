# EasyRoute AI Chatbot Integration Summary

This document serves as a complete reference for the Context-Aware AI Chatbot feature we built into the EasyRoute Logistics Platform.

---

## 1. What We Achieved
We successfully integrated a **Context-Aware AI Assistant** into the platform. 
- **Frontend:** A sleek, floating chat bubble that only appears for logged-in users. It manages conversation history and loading states.
- **Backend:** A Spring AI integration connected to the Groq API (using Llama 3.1) that acts as a logistics assistant.
- **Context Awareness (RAG):** The AI does not just answer generic questions. It dynamically queries the database for the logged-in user's profile and latest shipment data, and uses that exact data to answer questions accurately (e.g., "Where is my order?").

---

## 2. Errors We Faced & How We Fixed Them

1. **`500 Internal Server Error` (Maps API Key)**
   - *Issue:* The frontend called `/api/v1/config/maps-key`, but the backend was mapped to `/api/config`.
   - *Fix:* Updated `ConfigController.java` to use `@RequestMapping("/api/v1/config")`.

2. **`403 Forbidden` (AI Chat Endpoint)**
   - *Issue:* Spring Security blocked the AI chat request because the React frontend was using standard `fetch()` which didn't include the user's JWT login token.
   - *Fix:* Replaced `fetch()` with the configured `api.js` Axios instance, which automatically attaches the `Authorization: Bearer <token>` header. 

3. **`429 Insufficient Quota` (OpenAI)**
   - *Issue:* The OpenAI API key provided had run out of billing credits.
   - *Fix:* Switched the backend from OpenAI to **Groq**, a blazing fast, free alternative that uses open-source Llama models but supports the exact same code structure.

4. **`404 Unknown URL` (Groq)**
   - *Issue:* Spring AI automatically appends `/v1/chat/completions` to base URLs. We provided `https://api.groq.com/openai/v1`, resulting in an invalid double path (`/v1/v1/chat/completions`).
   - *Fix:* Updated `application.properties` to `spring.ai.openai.base-url=https://api.groq.com/openai`.

5. **`400 Model Decommissioned` (Groq)**
   - *Issue:* Groq recently retired the `llama3-8b-8192` model we tried to use.
   - *Fix:* Updated the model in `application.properties` to `llama-3.1-8b-instant`.

---

## 3. Data Flow Architecture

1. **User Action:** The user types a message in the React UI (e.g., "How many orders do I have?").
2. **Frontend Request:** `api.js` attaches the JWT token and sends a `GET` request to `/api/v1/ai/chat?message=...`.
3. **Security Intercept:** `JwtAuthenticationFilter` validates the token and sets the Security Context.
4. **Controller:** `AiController` receives the request, extracts the user's email from the `Authentication` object, and passes it to `AiService`.
5. **Context Building (RAG):** `AiService` fetches the User profile and their Shipments from the database. It counts pending/completed orders and formats the 10 most recent shipments.
6. **Prompt Injection:** A massive string is generated containing the user's stats and recent shipments. This is set as the "System Prompt".
7. **LLM Inference:** Spring AI sends the System Prompt + User Message to Groq's Llama 3.1 model.
8. **Response:** Groq reads the injected data, formulates an accurate answer, and sends it back through the backend to the React UI.

---

## 4. Security Measures Implemented

1. **JWT Enforcement:** The `/api/v1/ai/chat` endpoint is strictly protected. Anonymous users cannot query the AI or incur API costs.
2. **Strict Data Isolation:** The `AiService` uses the email extracted directly from the verified JWT token (not from a user-provided input). The AI only receives the shipments belonging to the person asking the question. Users cannot trick the AI into revealing other users' data because the AI simply doesn't have it.
3. **Environment Variables:** API keys (Groq, Maps) are stored in a `.env` file which is excluded via `.gitignore` to prevent leaking secrets to GitHub.
4. **Context Window Protection:** To prevent the AI from crashing due to memory limits, we cap the injected shipment history to a maximum of 10 recent shipments, while providing aggregate counts for the rest.

---

## 5. The Code We Wrote (With Comments)

### Backend: `AiController.java`
```java
package com.logistics.platform.controller;

import com.logistics.platform.service.AiService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

// Mark as a REST controller that returns JSON/Text
@RestController
// Base URL path for all endpoints in this controller
@RequestMapping("/api/v1/ai")
// Allow cross-origin requests from the React frontend
@CrossOrigin(origins = "*") 
public class AiController {

    private final AiService aiService;

    // Dependency Injection of the AiService
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    // Endpoint maps to GET /api/v1/ai/chat
    @GetMapping("/chat")
    public String chat(@RequestParam("message") String message, Authentication authentication) {
        // Extract the email of the currently logged-in user from the JWT token
        String email = authentication != null ? authentication.getName() : null;
        
        // Pass the message and the user's email to the service layer to get the AI response
        return aiService.getChatResponse(message, email);
    }
}
```

### Backend: `AiService.java`
```java
package com.logistics.platform.service;

import com.logistics.platform.dto.response.ShipmentResponse;
import com.logistics.platform.entity.User;
import com.logistics.platform.repository.UserRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AiService {

    private final ChatClient chatClient;
    private final UserRepository userRepository;
    private final ShipmentService shipmentService;

    // Inject required components: ChatClient (Spring AI), UserRepo, and ShipmentService
    public AiService(ChatClient.Builder chatClientBuilder, UserRepository userRepository, ShipmentService shipmentService) {
        this.chatClient = chatClientBuilder.build();
        this.userRepository = userRepository;
        this.shipmentService = shipmentService;
    }

    public String getChatResponse(String message, String email) {
        // Start building the base instructions for the AI
        StringBuilder systemPrompt = new StringBuilder();
        systemPrompt.append("You are an expert Logistics and Supply Chain Assistant. You help users with shipping, warehousing, inventory management, and transportation queries. Provide concise, professional, and accurate answers.");

        // If the user is logged in (which they always should be for this endpoint)
        if (email != null) {
            // Fetch user details from the database
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Fetch all shipments belonging to this user
                List<ShipmentResponse> shipments = shipmentService.getMyShipments(email, null);

                // Calculate statistics (how many are pending vs completed)
                long pending = shipments.stream().filter(s -> s.getStatus().name().equals("PENDING")).count();
                long completed = shipments.stream().filter(s -> s.getStatus().name().equals("DELIVERED")).count();

                // Sort shipments by newest first, take the top 10, and format them into readable text bullet points
                String recentShipments = shipments.stream()
                        .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
                        .limit(10)
                        .map(s -> String.format("- Tracking #%s: %s (From: %s To: %s)", s.getTrackingNumber(), s.getStatus(), s.getPickupCity(), s.getDropCity()))
                        .collect(Collectors.joining("\n"));

                // Inject the user's specific data into the AI's system prompt (Retrieval-Augmented Generation)
                systemPrompt.append("\n\n--- CURRENT USER CONTEXT ---\n");
                systemPrompt.append("You are currently talking directly to a registered user of the logistics platform. Always use this context to answer their personal questions. DO NOT ask them for their details, you already have them below:\n\n");
                
                // Add name, role, and contact info
                systemPrompt.append(String.format("Name: %s\nRole: %s\nContact: %s\n\n", user.getName(), user.getRole(), user.getPhone()));
                
                // Add aggregate stats
                systemPrompt.append(String.format("Shipment Statistics:\n- Total Shipments: %d\n- Pending Shipments: %d\n- Delivered Shipments: %d\n\n", shipments.size(), pending, completed));
                
                // Add the 10 recent shipment strings
                systemPrompt.append("10 Most Recent Shipments:\n");
                systemPrompt.append(recentShipments.isEmpty() ? "No recent shipments." : recentShipments);
                systemPrompt.append("\n----------------------------\n");
            }
        }

        // Make the actual call to the Groq API
        return chatClient.prompt()
                .system(systemPrompt.toString()) // Send our massive, injected context block
                .user(message)                   // Send the user's actual question
                .call()                          // Wait for response
                .content();                      // Extract text
    }
}
```

### Frontend: `AIChatWidget.jsx` (Snippet)
```javascript
// ... standard React setup ...
  const handleSend = async () => {
    if (!userMessage.trim()) return;

    // Add user's message to UI
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setUserMessage("");
    setIsLoading(true);

    try {
      // Use the configured api.js which automatically attaches the JWT token from local storage
      // This routes to http://localhost:8080/api/v1/ai/chat?message=...
      const response = await api.get(`/ai/chat?message=${encodeURIComponent(userMessage)}`);
      
      // Spring AI returns a raw string text block, not a JSON object.
      // axios automatically attaches it to response.data
      const data = response.data;
      
      // Add Bot's response to UI
      setMessages(prev => [...prev, { text: data, isBot: true }]);
    } catch (error) {
      // Error handling UI
      console.error("Failed to fetch AI response:", error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the server right now. Please try again later.", isBot: true, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };
// ... rest of component ...
```
