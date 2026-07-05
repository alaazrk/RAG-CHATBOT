import { useState } from "react";
import { Brain, Loader2, CheckCircle, XCircle } from "lucide-react";
import { colors } from "../config";

export default function QuizView({
  selectedDoc,
  quiz,
  isGeneratingQuiz,
  onGenerateQuiz,
}) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!selectedDoc) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: colors.textSecondary }}>
          Sélectionnez un document pour générer un quiz.
        </p>
      </div>
    );
  }

  if (isGeneratingQuiz) {
    return (
      <div className="flex-1 flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" />
        <span>Génération du quiz...</span>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Brain size={60} color={colors.accent} />

        <h2
          className="text-xl font-bold"
          style={{ color: colors.textPrimary }}
        >
          Générer un quiz
        </h2>

        <p style={{ color: colors.textSecondary }}>
          L'IA créera automatiquement un quiz basé sur ce PDF.
        </p>

        <button
          onClick={() => onGenerateQuiz(selectedDoc.name)}
          style={{
            background: colors.accent,
            color: "white",
          }}
          className="px-5 py-3 rounded-xl font-semibold"
        >
          Générer le Quiz
        </button>
      </div>
    );
  }

  function handleChoice(index, value) {
    setAnswers({
      ...answers,
      [index]: value,
    });
  }

  function calculateScore() {
    let score = 0;

    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.answer) score++;
    });

    return score;
  }

  const score = calculateScore();

  return (
    <div className="flex-1 overflow-y-auto p-6">

      <div
        className="rounded-2xl p-6"
        style={{
          background: colors.bgPanel,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Brain color={colors.accent} />
          <h2
            className="text-xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            {quiz.title}
          </h2>
        </div>

        {quiz.questions.map((q, index) => (
          <div
            key={index}
            className="mb-8"
          >
            <h3
              className="font-semibold mb-3"
              style={{ color: colors.textPrimary }}
            >
              {index + 1}. {q.question}
            </h3>

            {q.type === "mcq" &&
              q.choices.map((choice) => (
                <label
                  key={choice}
                  className="flex items-center gap-2 mb-2 cursor-pointer"
                  style={{ color: colors.textSecondary }}
                >
                  <input
                    type="radio"
                    name={`q-${index}`}
                    value={choice}
                    disabled={submitted}
                    onChange={() => handleChoice(index, choice)}
                  />

                  {choice}
                </label>
              ))}

            {q.type === "true_false" && (
              <>
                <label className="flex gap-2 mb-2">
                  <input
                    type="radio"
                    name={`q-${index}`}
                    onChange={() => handleChoice(index, true)}
                    disabled={submitted}
                  />
                  Vrai
                </label>

                <label className="flex gap-2">
                  <input
                    type="radio"
                    name={`q-${index}`}
                    onChange={() => handleChoice(index, false)}
                    disabled={submitted}
                  />
                  Faux
                </label>
              </>
            )}

            {q.type === "short" && (
              <textarea
                disabled={submitted}
                rows={3}
                className="w-full rounded-xl p-3 bg-transparent border"
                style={{
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                onChange={(e) =>
                  handleChoice(index, e.target.value)
                }
              />
            )}

            {submitted && (
              <div className="mt-3">

                {answers[index] === q.answer ? (
                  <div className="flex gap-2 text-green-400">
                    <CheckCircle size={18} />
                    Bonne réponse
                  </div>
                ) : (
                  <div className="flex gap-2 text-red-400">
                    <XCircle size={18} />
                    Mauvaise réponse
                  </div>
                )}

                <p
                  className="mt-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  <b>Réponse :</b> {String(q.answer)}
                </p>

                <p
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {q.explanation}
                </p>

              </div>
            )}
          </div>
        ))}

        {!submitted && (
          <button
            onClick={() => setSubmitted(true)}
            style={{
              background: colors.accent,
              color: "white",
            }}
            className="px-6 py-3 rounded-xl font-semibold"
          >
            Valider
          </button>
        )}

        {submitted && (
          <div
            className="mt-8 text-xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Score : {score} / {quiz.questions.length}
          </div>
        )}
      </div>
    </div>
  );
}