# Schemat bazy danych – FollowApp (PostgreSQL / Supabase)

## 1. Tabele

### 1.1 `users`  _(źródło: `auth.users`)_
Tabela wbudowana w Supabase – przechowuje dane logowania i identyfikator `id` (UUID).  Nie tworzymy dodatkowych kolumn profilowych w MVP.

### 1.2 `threads`
| Kolumna        | Typ danych          | Ograniczenia                                         |
|----------------|---------------------|------------------------------------------------------|
| id             | UUID                | PK, `default gen_random_uuid()`                      |
| user_id        | UUID                | FK → `auth.users.id` ON DELETE CASCADE NOT NULL      |
| name           | VARCHAR(20)         | NOT NULL, `check (char_length(name) BETWEEN 1 AND 20)`, unikalność w obrębie użytkownika |
| created_at     | TIMESTAMPTZ         | NOT NULL, `default now()`                            |

Dodatkowe artefakty:
* Unikalny indeks (case-sensitive) `uniq_threads_user_name` na `(user_id, name)`.
* Trigger `threads_limit_per_user_bi` (BEFORE INSERT) – blokuje dodanie >20 wątków na użytkownika.

### 1.3 `transcripts`
| Kolumna        | Typ danych  | Ograniczenia                                        |
|----------------|-------------|-----------------------------------------------------|
| id             | UUID        | PK, `default gen_random_uuid()`                     |
| thread_id      | UUID        | FK → `threads.id` ON DELETE CASCADE NOT NULL        |
| content        | TEXT        | NOT NULL (brak limitu znaków wymuszanego przez DB)  |
| created_at     | TIMESTAMPTZ | NOT NULL, `default now()`                           |

### 1.4 `action_points`
| Kolumna        | Typ danych  | Ograniczenia                                                    |
|----------------|-------------|-----------------------------------------------------------------|
| id             | UUID        | PK, `default gen_random_uuid()`                                 |
| thread_id      | UUID        | FK → `threads.id` ON DELETE CASCADE NOT NULL                    |
| title          | VARCHAR(255)| NOT NULL                                                        |
| is_completed   | BOOLEAN     | NOT NULL `default FALSE`                                        |
| created_at     | TIMESTAMPTZ | NOT NULL, `default now()`                                       |


## 2. Relacje
1. `auth.users (1) → (N) threads` – jeden użytkownik posiada wiele wątków. Usunięcie użytkownika usuwa jego wątki oraz powiązane dane (ON DELETE CASCADE).
2. `threads (1) → (N) transcripts` – wątek ma wiele transkrypcji.
3. `threads (1) → (N) action_points` – wątek ma wiele action pointów.

Wszystkie relacje są **jeden-do-wielu**; brak relacji wiele-do-wielu w MVP.


## 3. Indeksy
| Nazwa                     | Tabela        | Kolumny                | Cel |
|---------------------------|---------------|------------------------|-----|
| threads_pkey              | threads       | id                     | PK  |
| uniq_threads_user_name    | threads       | (user_id, name)        | Wymuszenie unikalnej nazwy wątku per użytkownik |
| transcripts_pkey          | transcripts   | id                     | PK  |
| action_points_pkey        | action_points | id                     | PK  |
| fk_threads_user           | threads       | user_id                | Przyspieszenie filtracji wątków po użytkowniku |
| fk_transcripts_thread     | transcripts   | thread_id              | Szybsze pobieranie transkrypcji danego wątku |
| fk_action_points_thread   | action_points | thread_id              | Szybsze pobieranie AP dla wątku |

> Przy obecnym, niewielkim wolumenie danych dodatkowe indeksy (np. na `created_at`) uznano za zbędne, ale mogą zostać dodane w przyszłości bez migracji danych.


## 4. Zasady bezpieczeństwa (RLS)
Wszystkie niestandardowe tabele (`threads`, `transcripts`, `action_points`) mają **włączone RLS**.

### 4.1 `threads`
```sql
-- Allow owner to select / insert / update / delete own threads
CREATE POLICY "Threads: owner access" ON threads
  FOR ALL USING ( auth.uid() = user_id );
```

### 4.2 `transcripts`
```sql
-- Access through parent thread ownership
CREATE POLICY "Transcripts: owner access" ON transcripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM threads t
      WHERE t.id = thread_id AND t.user_id = auth.uid()
    )
);
```

### 4.3 `action_points`
```sql
-- Access through parent thread ownership
CREATE POLICY "AP: owner access" ON action_points
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM threads t
      WHERE t.id = thread_id AND t.user_id = auth.uid()
    )
);
```

Supabase wymusza schemat bezpieczeństwa – brak dodatkowych ról administracyjnych w MVP.


## 5. Dodatkowe uwagi
1. **Trigger limitujący liczbę wątków:**
   ```sql
   CREATE OR REPLACE FUNCTION enforce_threads_limit()
   RETURNS TRIGGER LANGUAGE plpgsql AS $$
   BEGIN
     IF (SELECT COUNT(*) FROM threads WHERE user_id = NEW.user_id) >= 20 THEN
       RAISE EXCEPTION 'User may have max 20 threads';
     END IF;
     RETURN NEW;
   END;
   $$;

   CREATE TRIGGER threads_limit_per_user_bi
   BEFORE INSERT ON threads
   FOR EACH ROW EXECUTE FUNCTION enforce_threads_limit();
   ```
2. **Unikalność nazw wątków:** PostgreSQL porównuje `VARCHAR` case-sensitively w domyślnym kollation, więc indeks `uniq_threads_user_name` gwarantuje brak duplikatów nazwy w obrębie jednego użytkownika.
3. **Hard-delete zamiast soft-delete:** tabele nie zawierają pól `deleted_at`; przypadkowa utrata danych może być mitigowana na poziomie backupów bazy.
4. **Brak pól `updated_at`, `completed_at` czy logów audytowych** zgodnie z zakresem MVP.
5. **Supabase rozszerzenia:** wymagane rozszerzenia `pgcrypto` (dla `gen_random_uuid`) są domyślnie włączone w Supabase.
