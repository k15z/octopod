from octopod.models import Podclip

class ContentFilter:
    """
    Manages the history of content that a user has seen, and determines if a new piece of 
    content is okay to show to the user.
    """

    def __init__(self):
        self._podcast_to_history = {}

    def add(self, podclip: Podclip):
        if podclip.podcast_id not in self._podcast_to_history:
            self._podcast_to_history[podclip.podcast_id] = []
        # TODO: Read an algorithms/data structure book. But let's brute force this for now.
        self._podcast_to_history[podclip.podcast_id].append((podclip.start_time, podclip.end_time))

    def okay(self, podclip: Podclip):
        if podclip.podcast_id not in self._podcast_to_history:
            # New podcast, no history, so we're good.
            return True

        max_overlap_secs = 0.0
        for start, end in self._podcast_to_history[podclip.podcast_id]:
            overlap_secs = max(0, min(podclip.end_time, end) - max(podclip.start_time, start))
            if overlap_secs > max_overlap_secs:
                max_overlap_secs = overlap_secs
        if max_overlap_secs > 30:
            return False # Overlap is too large, user has already seen this content.
        
        return True
