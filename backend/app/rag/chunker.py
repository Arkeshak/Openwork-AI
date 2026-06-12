import re

def chunk_text(
    text: str,
    chunk_size: int = 800,
    chunk_overlap: int = 150
):
    """
    Chunks text by splitting on words, ensuring chunks are roughly `chunk_size` characters
    with `chunk_overlap` characters of overlap to preserve context.
    """
    if not text or not text.strip():
        return []

    # Clean up whitespace slightly
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    words = text.split()
    chunks = []
    
    current_chunk = []
    current_length = 0
    
    i = 0
    while i < len(words):
        word = words[i]
        word_len = len(word) + 1 # +1 for space
        
        if current_length + word_len > chunk_size and current_length > 0:
            # Chunk is full, finalize it
            chunks.append(" ".join(current_chunk))
            
            # Backtrack to create overlap
            overlap_length = 0
            backtrack_idx = i - 1
            
            # Rebuild current_chunk for the next iteration using overlap
            overlap_words = []
            while backtrack_idx >= 0:
                bw = words[backtrack_idx]
                if overlap_length + len(bw) + 1 > chunk_overlap:
                    break
                overlap_words.insert(0, bw)
                overlap_length += len(bw) + 1
                backtrack_idx -= 1
                
            current_chunk = overlap_words
            current_length = overlap_length
            
            # We don't increment i here because we want to process the current word
            # in the new chunk
        else:
            current_chunk.append(word)
            current_length += word_len
            i += 1
            
    # Add the last chunk
    if current_chunk:
        chunks.append(" ".join(current_chunk))
        
    return chunks
