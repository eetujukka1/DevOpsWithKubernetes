import { useEffect, useState } from "react";

const DEFAULT_API_BASE_URL = "/api";
const IMAGE_STORAGE_KEY = "todo-app-image-cache";
const MAX_IMAGE_AGE_MS = 10 * 60 * 1000;
const DEFAULT_PICSUM_TEMPLATE = "https://picsum.photos/seed/${seed}/1200/640";

const createImageUrl = (template = DEFAULT_PICSUM_TEMPLATE) => {
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return template.replace("${seed}", seed);
};

const readCachedImage = () => {
  const rawValue = window.localStorage.getItem(IMAGE_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const cachedImage = JSON.parse(rawValue);

    if (!cachedImage?.url || !cachedImage?.savedAt) {
      return null;
    }

    if (Date.now() - cachedImage.savedAt > MAX_IMAGE_AGE_MS) {
      window.localStorage.removeItem(IMAGE_STORAGE_KEY);
      return null;
    }

    return cachedImage.url;
  } catch (_error) {
    window.localStorage.removeItem(IMAGE_STORAGE_KEY);
    return null;
  }
};

const readConfigValue = async (path, fallbackValue) => {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      return fallbackValue;
    }

    const value = (await response.text()).trim();
    return value || fallbackValue;
  } catch (_error) {
    return fallbackValue;
  }
};

export default function App() {
  const [cachedImage] = useState(() => readCachedImage());
  const [todos, setTodos] = useState([]);
  const [todoText, setTodoText] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [imageUrl, setImageUrl] = useState(cachedImage || "");
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);
  const [isSavingTodo, setIsSavingTodo] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(!cachedImage);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadApiBaseUrl = async () => {
      const configuredApiBaseUrl = await readConfigValue(
        "/config/frontend.apiBaseUrl",
        DEFAULT_API_BASE_URL,
      );
      setApiBaseUrl(configuredApiBaseUrl);
    };

    loadApiBaseUrl();
  }, []);

  useEffect(() => {
    if (!apiBaseUrl) {
      return;
    }

    const loadTodos = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/todos`);
        if (!response.ok) {
          throw new Error("Failed to load todos.");
        }

        const nextTodos = await response.json();
        setTodos(Array.isArray(nextTodos) ? nextTodos : []);
      } catch (error) {
        setErrorMessage(error.message || "Failed to load todos.");
      } finally {
        setIsLoadingTodos(false);
      }
    };

    loadTodos();
  }, [apiBaseUrl]);

  useEffect(() => {
    if (cachedImage) {
      return;
    }

    const loadImage = async () => {
      const template = await readConfigValue("/config/picsum.url", DEFAULT_PICSUM_TEMPLATE);
      setImageUrl(createImageUrl(template));
    };

    loadImage();
  }, [cachedImage]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTodo = todoText.trim();
    if (!trimmedTodo) {
      setErrorMessage("Todo text is required.");
      return;
    }

    if (trimmedTodo.length > 140) {
      setErrorMessage("Todo text must be 140 characters or less.");
      return;
    }

    setIsSavingTodo(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBaseUrl || DEFAULT_API_BASE_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmedTodo }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save todo.");
      }

      setTodos((currentTodos) => [payload, ...currentTodos]);
      setTodoText("");
    } catch (error) {
      setErrorMessage(error.message || "Failed to save todo.");
    } finally {
      setIsSavingTodo(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">DevOps With Kubernetes</p>
          <h1>Todo dashboard</h1>
          <p className="lede">
            The frontend now runs as a Vite React app and persists todos through the backend API.
          </p>
        </div>

        <div className="image-panel">
          {imageUrl ? (
            <img
              className={isLoadingImage ? "is-hidden" : ""}
              src={imageUrl}
              alt="Random scenic placeholder"
              onLoad={() => {
                window.localStorage.setItem(
                  IMAGE_STORAGE_KEY,
                  JSON.stringify({ url: imageUrl, savedAt: Date.now() }),
                );
                setIsLoadingImage(false);
              }}
              onError={() => {
                setIsLoadingImage(false);
                setErrorMessage("Failed to load image.");
              }}
            />
          ) : null}
          {isLoadingImage ? <div className="image-placeholder">Loading image...</div> : null}
        </div>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Add todo</h2>
            <span>{todoText.trim().length}/140</span>
          </div>

          <form className="todo-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="todo-input">
              Todo text
            </label>
            <input
              id="todo-input"
              name="todo"
              type="text"
              placeholder="Write a todo"
              maxLength={140}
              value={todoText}
              onChange={(event) => setTodoText(event.target.value)}
            />
            <button type="submit" disabled={isSavingTodo}>
              {isSavingTodo ? "Saving..." : "Add todo"}
            </button>
          </form>

          <p className="hint">Todos are limited to 140 characters.</p>
          {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Existing todos</h2>
            <span>{todos.length}</span>
          </div>

          {isLoadingTodos ? (
            <p className="state-copy">Loading todos...</p>
          ) : todos.length === 0 ? (
            <p className="state-copy">No todos yet.</p>
          ) : (
            <ul className="todo-list">
              {todos.map((todo) => (
                <li key={todo.id}>
                  <span>{todo.text}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
