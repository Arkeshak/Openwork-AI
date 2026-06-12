import logging
import google.generativeai as genai
from google.api_core.exceptions import GoogleAPICallError, ResourceExhausted, PermissionDenied, InvalidArgument
from app.core.config import settings

logger = logging.getLogger("app.services.gemini_service")
logger.setLevel(logging.DEBUG)

# Configure the SDK using the Pydantic settings
api_key = settings.GEMINI_API_KEY
if api_key:
    genai.configure(api_key=api_key)
else:
    logger.warning("GEMINI_API_KEY is not configured in settings.")

class GeminiService:

    @staticmethod
    def generate(prompt: str, timeout: float = 30.0) -> str:
        """
        Generates content for a given prompt using gemini-2.5-flash.
        Includes error handling, timeouts, and debug logging.
        """
        if not prompt or not prompt.strip():
            logger.warning("GeminiService: Empty prompt received for generation.")
            return "Prompt cannot be empty."

        current_api_key = settings.GEMINI_API_KEY
        if not current_api_key:
            logger.error("GeminiService: GEMINI_API_KEY setting is missing.")
            return "Gemini API key is not configured. Please set the GEMINI_API_KEY in the settings."

        # Re-configure using the current API key
        genai.configure(api_key=current_api_key)

        try:
            logger.debug(f"Gemini Request - Prompt Length: {len(prompt)}")
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            response = model.generate_content(
                prompt,
                request_options={"timeout": timeout}
            )

            if not response or not response.text:
                logger.warning("GeminiService: Received empty response from Gemini API.")
                return "The AI service returned an empty response."

            logger.debug(f"Gemini Response Length: {len(response.text)}")
            return response.text

        except PermissionDenied as e:
            logger.error(f"GeminiService: Permission denied (invalid API key): {str(e)}")
            return "Authentication failed. The provided Gemini API key is invalid or unauthorized."
        except ResourceExhausted as e:
            logger.error(f"GeminiService: Rate limit exceeded: {str(e)}")
            return "Rate limit exceeded. Please try again in a few moments."
        except InvalidArgument as e:
            logger.error(f"GeminiService: Invalid argument: {str(e)}")
            return "An invalid request was sent to the AI service."
        except GoogleAPICallError as e:
            logger.error(f"GeminiService: API call failed: {str(e)}")
            return "The AI service encountered an error processing your request."
        except Exception as e:
            logger.error(f"GeminiService: Unexpected error: {str(e)}")
            return "An unexpected error occurred while generating the response."

    @staticmethod
    def generate_stream(prompt: str, timeout: float = 30.0):
        """
        Streams content generation tokens using gemini-2.5-flash.
        """
        if not prompt or not prompt.strip():
            logger.warning("GeminiService Stream: Empty prompt received.")
            yield "Prompt cannot be empty."
            return

        current_api_key = settings.GEMINI_API_KEY
        if not current_api_key:
            logger.error("GeminiService Stream: GEMINI_API_KEY setting is missing.")
            yield "Gemini API key is not configured."
            return

        genai.configure(api_key=current_api_key)

        try:
            logger.debug(f"Gemini Stream Request - Prompt Length: {len(prompt)}")
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            response = model.generate_content(
                prompt,
                stream=True,
                request_options={"timeout": timeout}
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        except PermissionDenied as e:
            logger.error(f"GeminiService Stream: Permission denied: {str(e)}")
            yield "Authentication failed: invalid Gemini API key."
        except ResourceExhausted as e:
            logger.error(f"GeminiService Stream: Rate limit exceeded: {str(e)}")
            yield "Rate limit exceeded. Please try again soon."
        except GoogleAPICallError as e:
            logger.error(f"GeminiService Stream: API call failed: {str(e)}")
            yield "The AI service encountered an error."
        except Exception as e:
            logger.error(f"GeminiService Stream: Unexpected error: {str(e)}")
            yield "An unexpected error occurred."
