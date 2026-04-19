import { Button, Card, Chip, Input, TextArea } from '@heroui/react';
import type { FaqItem, Scenario } from '../../../shared/model/types';

type KnowledgeSectionProps = {
  faqItems: FaqItem[];
  scenarios: Scenario[];
  faqQuestion: string;
  setFaqQuestion: (value: string) => void;
  faqAnswer: string;
  setFaqAnswer: (value: string) => void;
  scenarioCode: string;
  setScenarioCode: (value: string) => void;
  scenarioTitle: string;
  setScenarioTitle: (value: string) => void;
  scenarioDescription: string;
  setScenarioDescription: (value: string) => void;
  onCreateFaqItem: () => Promise<void>;
  onCreateScenario: () => Promise<void>;
};

export function KnowledgeSection({
  faqItems,
  scenarios,
  faqQuestion,
  setFaqQuestion,
  faqAnswer,
  setFaqAnswer,
  scenarioCode,
  setScenarioCode,
  scenarioTitle,
  setScenarioTitle,
  scenarioDescription,
  setScenarioDescription,
  onCreateFaqItem,
  onCreateScenario
}: KnowledgeSectionProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <Card.Header>
          <div>
            <p className="text-sm uppercase tracking-[0.22em]">FAQ</p>
            <h2 className="text-xl font-semibold">База знаний</h2>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid gap-3">
            <Input aria-label="Вопрос" placeholder="Вопрос" value={faqQuestion} onChange={(event) => setFaqQuestion(event.target.value)} />
            <TextArea
              aria-label="Ответ"
              placeholder="Ответ"
              value={faqAnswer}
              onChange={(event) => setFaqAnswer(event.target.value)}
              rows={5}
              variant="secondary"
            />
            <Button variant="primary" onPress={() => void onCreateFaqItem()}>
              Добавить FAQ
            </Button>
          </div>

          <div className="grid gap-3">
            {faqItems.map((item) => (
              <div key={item.id} className="rounded-3xl border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.question}</p>
                  <Chip size="sm" variant="soft" color={item.isActive ? 'success' : 'default'}>
                    {item.isActive ? 'активен' : 'скрыт'}
                  </Chip>
                  <Chip size="sm" variant="soft" color="accent">
                    {item.usageCount} uses
                  </Chip>
                </div>
                <p className="mt-2 text-sm">{item.answer}</p>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <div>
            <p className="text-sm uppercase tracking-[0.22em]">Сценарии</p>
            <h2 className="text-xl font-semibold">Диалоговые ветки</h2>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="grid gap-3">
            <Input aria-label="Код сценария" placeholder="Код сценария" value={scenarioCode} onChange={(event) => setScenarioCode(event.target.value)} />
            <Input aria-label="Название" placeholder="Название" value={scenarioTitle} onChange={(event) => setScenarioTitle(event.target.value)} />
            <TextArea
              aria-label="Описание"
              placeholder="Описание"
              value={scenarioDescription}
              onChange={(event) => setScenarioDescription(event.target.value)}
              rows={4}
              variant="secondary"
            />
            <Button variant="primary" onPress={() => void onCreateScenario()}>
              Добавить сценарий
            </Button>
          </div>

          <div className="grid gap-3">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="rounded-3xl border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{scenario.title}</p>
                  <Chip size="sm" variant="soft" color={scenario.isActive ? 'success' : 'default'}>
                    {scenario.isActive ? 'активен' : 'выключен'}
                  </Chip>
                  <Chip size="sm" variant="soft" color="accent">
                    {scenario.code}
                  </Chip>
                </div>
                <p className="mt-2 text-sm">{scenario.description ?? 'Описание не задано'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {scenario.triggerPhrases.slice(0, 4).map((phrase) => (
                    <Chip key={phrase} size="sm" variant="soft" color="default">
                      {phrase}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
