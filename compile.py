import json
from glob import glob
from mako.template import Template

html = Template(filename="template.html")

highlights = []
for path in glob("output/*.json"):
    with open(path) as f:
        data = json.load(f)
        data["audio_url"] = path.split("/")[-1].replace(".json", ".mp3")
        highlights.append(data)
print(len(highlights))
highlights = sorted(highlights, key=lambda x: x["start_time"])

html = html.render(highlights=highlights)

with open("output/index.html", "w") as f:
    f.write(html)
