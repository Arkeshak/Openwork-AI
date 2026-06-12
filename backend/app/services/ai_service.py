import logging
from app.services.gemini_service import GeminiService

logger = logging.getLogger("app.services.ai_service")
logger.setLevel(logging.DEBUG)

class AIService:

    @staticmethod
    def ask(prompt: str) -> str:
        """
        Simple prompt generation helper for debug or simple AI routes.
        """
        logger.debug(f"AIService ask: prompt length: {len(prompt)}")
        response = GeminiService.generate(prompt)
        logger.debug(f"AIService ask response: {response[:200]}...")
        return response

    @staticmethod
    def condense_query(question: str, history: str) -> str:
        """
        Uses Gemini to rewrite a follow-up question and conversation history
        into a standalone search query.
        """
        if not history or not history.strip():
            logger.debug("AIService condense_query: Empty history, returning original question.")
            return question

        prompt = f"""Given the following conversation history and a follow-up question, rewrite the follow-up question to be a standalone query that contains all necessary context from the conversation history (e.g. resolving pronouns like 'he', 'she', 'it', 'this person', or references like 'other information', 'tell me more', 'give details').
Do NOT answer the question. Just output the rewritten standalone search query.

Conversation History:
{history}

Follow-up Question:
{question}

Standalone Query:"""

        logger.debug(f"AIService condense_query input question: '{question}'")
        standalone_query = GeminiService.generate(prompt)
        standalone_query = standalone_query.strip().strip('"').strip("'")
        logger.debug(f"AIService condense_query output query: '{standalone_query}'")
        return standalone_query

    @staticmethod
    def chat_with_history(messages: list) -> str:
        """
        Takes a list of message dicts like [{"role": "user", "content": "..."}, ...]
        and generates the next response in the conversation history using Gemini.
        """
        logger.debug(f"AIService chat_with_history: Processing {len(messages)} messages.")
        if not messages:
            logger.warning("AIService chat_with_history: Empty message list received.")
            return "No messages provided."

        history = messages[:-1]
        latest_message = messages[-1]

        gemini_history: list[dict[str, str | list[str]]] = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({
                "role": role,
                "parts": [msg["content"]]
            })

        try:
            import google.generativeai as genai
            from typing import cast, Any
            model = genai.GenerativeModel("gemini-2.5-flash")
            chat = model.start_chat(history=cast(Any, gemini_history))
            response = chat.send_message(latest_message["content"])
            logger.debug(f"AIService chat_with_history response: {response.text[:200]}...")
            return response.text
        except Exception as e:
            logger.error(f"AIService chat_with_history API error: {e}. Falling back to formatted prompt string.")
            # Fallback formatting as plain text chat
            prompt_parts = []
            for msg in messages:
                role_name = "User" if msg["role"] == "user" else "Assistant"
                prompt_parts.append(f"{role_name}: {msg['content']}")
            prompt_parts.append("Assistant:")
            prompt = "\n".join(prompt_parts)
            return GeminiService.generate(prompt)

    @staticmethod
    def rag_answer(question: str, context: str) -> str:
        """
        Generates an answer based on the retrieved document context.
        Handles casual greetings and conversation gracefully when context is empty.
        """
        logger.debug(f"AIService rag_answer - Question: {question}")
        logger.debug(f"AIService rag_answer - Retrieved Context: {context}")

        prompt = f"""You are an AI assistant that answers questions based on uploaded documents.

Document Context:
{context}

Question:
{question}

Rules:
1. Use document context when available.
2. If the question is a general greeting or casual chat (e.g. "Hi", "Hello", "How are you?", "Thank you"), respond politely and naturally using your general knowledge.
3. If the user is asking about document details or specific information, and it is not found in the context, say:
   "I cannot find that information in the uploaded documents."
4. Never hallucinate.

Answer:"""

        logger.debug(f"AIService rag_answer - Prompt Length: {len(prompt)}")
        response = GeminiService.generate(prompt)
        logger.debug(f"AIService rag_answer - Gemini Response: {response}")
        return response

    @staticmethod
    def rag_answer_with_history(question: str, context: str, history: str) -> str:
        """
        Generates an answer based on context and chat session history.
        Uses history to understand references (he, she, it, etc.) and handles general chat.
        """
        logger.debug(f"AIService rag_answer_with_history - Question: {question}")
        logger.debug(f"AIService rag_answer_with_history - Retrieved Context: {context}")

        prompt = f"""You are an AI assistant that answers questions based on uploaded documents.

Use conversation history to understand references such as:
* he
* she
* it
* this person
* that person
* other information
* tell me more
* continue
* explain further

Conversation History:
{history}

Document Context:
{context}

Question:
{question}

Rules:
1. Use document context when available.
2. Use conversation history to resolve references.
3. If information exists in context, answer it.
4. If the question is a general greeting or casual chat (e.g. "Hi", "Hello", "How are you?", "Thank you"), respond politely and naturally using your general knowledge.
5. If the user is asking about document details or specific information, and it is not found in the context, say:
   "I cannot find that information in the uploaded documents."
6. Never hallucinate.

Answer:"""

        logger.debug(f"AIService rag_answer_with_history - Prompt Length: {len(prompt)}")
        response = GeminiService.generate(prompt)
        logger.debug(f"AIService rag_answer_with_history - Gemini Response: {response}")
        return response

    @staticmethod
    def stream_rag_answer_with_history(question: str, context: str, history: str):
        """
        Streams response tokens based on context and chat session history.
        Uses history to understand references (he, she, it, etc.) and handles general chat.
        """
        logger.debug(f"AIService stream_rag_answer_with_history - Question: {question}")
        logger.debug(f"AIService stream_rag_answer_with_history - Retrieved Context: {context}")

        prompt = f"""You are an AI assistant that answers questions based on uploaded documents.

Use conversation history to understand references such as:
* he
* she
* it
* this person
* that person
* other information
* tell me more
* continue
* explain further

Conversation History:
{history}

Document Context:
{context}

Question:
{question}

Rules:
1. Use document context when available.
2. Use conversation history to resolve references.
3. If information exists in context, answer it.
4. If the question is a general greeting or casual chat (e.g. "Hi", "Hello", "How are you?", "Thank you"), respond politely and naturally using your general knowledge.
5. If the user is asking about document details or specific information, and it is not found in the context, say:
   "I cannot find that information in the uploaded documents."
6. Never hallucinate.

Answer:"""

        logger.debug(f"AIService stream_rag_answer_with_history - Prompt Length: {len(prompt)}")

        response_parts = []
        for token in GeminiService.generate_stream(prompt):
            response_parts.append(token)
            yield token

        full_response = "".join(response_parts)
        logger.debug(f"AIService stream_rag_answer_with_history - Gemini Full Response: {full_response}")
