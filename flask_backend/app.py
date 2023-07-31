import cohere
import openai
import replicate
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
# from transformers import GPTNeoForCausalLM, GPT2Tokenizer, AutoModelForCausalLM, AutoTokenizer
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# model = GPTNeoForCausalLM.from_pretrained("EleutherAI/gpt-neo-1.3B")
# tokenizer = GPT2Tokenizer.from_pretrained("EleutherAI/gpt-neo-1.3B")

# checkpoint = "Salesforce/codegen-350M-mono"
# model2 = AutoModelForCausalLM.from_pretrained(checkpoint)
# tokenizer2 = AutoTokenizer.from_pretrained(checkpoint)


# def gptneo(prompt):
#     input_ids = tokenizer(prompt, return_tensors="pt").input_ids

#     gen_tokens = model.generate(
#         input_ids,
#         do_sample=True,
#         temperature=0.9,
#         max_length=100,
#     )

#     return tokenizer.batch_decode(gen_tokens)[0]


# def codegen(prompt):
#     completion = model2.generate(**tokenizer2(prompt, return_tensors="pt"))

#     return (tokenizer2.decode(completion[0]))


load_dotenv()


@app.route("/getres", methods=["POST"])
def call_api():
    try:
        data = request.get_json()
        prompt = data["prompt"]
        model = data["model"]

        match model:
            case "command-nightly":
                co = cohere.Client(os.getenv("COHERE_API_KEY"))

                response = co.generate(
                    model=model,
                    prompt=prompt,
                    max_tokens=200,
                )

                answer = response.generations[0].text

            case "gpt-3.5-turbo":
                openai.api_key = os.getenv("OPENAI_API_KEY")

                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=500,
                )

                answer = response.choices[0].message["content"]

            case "stable-diffusion":
                response = replicate.run(
                    "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
                    input={"prompt": prompt},
                )

                answer = response[-1]

            # case "gpt-neo-1.3B":
            #     answer = gptneo(prompt)

            # case "codegen-350M-mono":
            #     answer = codegen(prompt)

        return jsonify({"answer": answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
