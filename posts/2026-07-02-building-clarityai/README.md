# Building ClarityAI at the USAII Hackathon

AbdulRahman Maniar and I built ClarityAI for the USAII Global AI Hackathon 2026. The idea came from documents that are hard to understand when you’re already under pressure: an eviction notice, a medical bill, or a letter with a deadline buried in it.

We built a progressive web app that takes a document and produces a plain-language action plan. The prototype supported English, Spanish, French, Arabic, Chinese, and Hindi.

We received 70 out of 70 from the core judge but didn’t make the final panel.

## Getting Text Out of a Document

We deployed the application in Docker through Coolify. The backend routed documents through `pypdf` or `pytesseract`, depending on whether it needed PDF text extraction or OCR, then scrubbed personal data before sending the text to NVIDIA Nemotron 3 Super 120B for task extraction and urgency classification.

That first decision matters. A PDF can contain selectable text, scanned page images, or both. As the [pypdf documentation](https://pypdf.readthedocs.io/en/latest/user/extract-text.html) explains, extracting embedded text and recognizing text in an image are different jobs. pypdf itself is not an OCR engine.

OCR adds its own errors. A misread date can change what the rest of the system thinks is urgent. Formatting and incomplete extraction can also lose the relationship between a heading and the paragraph beneath it.

## Making the Output Checkable

We put the extracted source sentences alongside the generated output and displayed confidence scores. Users had to review the output before external links unlocked.

Those choices gave users something to compare against the action plan. They didn’t establish that the model was correct. A displayed confidence score is especially easy to overinterpret; without calibration against representative documents, it isn’t a measured probability of correctness.

We also used asynchronous Brave Search retrieval to look for local assistance. Keeping that work separate let the interface progress without waiting for every search response. But a search result still needs checking: it may refer to the wrong jurisdiction, an outdated service, or an organization that can’t help with that document.

## Evaluating the Output

Our backend was stateless, but that alone doesn’t prove that uploaded information leaves no traces. Logs, temporary files, and third-party services all need separate review. Scrubbing personal data is also a mitigation, not a guarantee that every identifying detail is removed.

Evaluation needs to distinguish extraction failures from unsupported model conclusions. A test set with checked dates, tasks, and source passages would make those errors easier to measure than simply checking whether the app returns an answer.

## References

- [pypdf: Extract Text from a PDF](https://pypdf.readthedocs.io/en/latest/user/extract-text.html)
- [pytesseract: Python Wrapper for Tesseract OCR](https://github.com/madmaze/pytesseract)
