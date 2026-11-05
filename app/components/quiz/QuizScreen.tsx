import { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { Lightbulb } from "lucide-react-native";
import { usePalette } from "@/constants/palette";
import { GUTTER, T, Tag } from "@/components/ds";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AutoHeightWebView from "react-native-autoheight-webview";
import { useTour } from "@/context/TourContext";
import { TOTAL_TOUR_STEPS } from "@/constants/tourSteps";
import { wrapHtmlContent } from "@/lib/htmlWrapper";
import { ResetTestDialog } from "@/components/modals/ResetTestDialog";
import AllTasksDialog from "@/components/modals/AllTasksDialog";
import { HintModal } from "@/components/modals/HintModal";
import QuestionImage from "@/components/QuestionImage";
import QuizHeader, { QuizHeaderRef } from "@/components/TP components/QuizHeader";
import QuestionToggles from "@/components/TP components/QuestionToggles";
import QuestionOptions from "@/components/TP components/QuestionOptionsProps";
import QuestionBottomNav from "@/components/TP components/QuestionBottomNav";
import ResultsModal from "@/components/TP components/ResultsCard";
import { QuizSessionProps, useQuizSession } from "./useQuizSession";
import { useLeaveGuard } from "./useLeaveGuard";

interface QuizScreenProps extends QuizSessionProps {
  nextTopicUrl?: string;
}

// Quiz page for every test type: topic, course, improve, wrong, saved, exam
export default function QuizScreen(props: QuizScreenProps) {
  const { quiz, token, backUrl = "", nextTopicUrl, pageType = "topic" } = props;
  const c = usePalette();
  const isDark = c.isDark;
  const currentIconColor = c.ink;

  const { state, isSubmitting, leavingRef, actions } = useQuizSession(props);
  const { questions, index, selected, answered, results } = state;

  useLeaveGuard(actions.leave, leavingRef);

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isAllTasksDialogOpen, setIsAllTasksDialogOpen] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const quizHeaderRef = useRef<QuizHeaderRef>(null);

  // Tour
  const { tourActive, currentStep, setCurrentStep, endTour, skipTour, numbersQuizId } = useTour();
  const handleTourNext = () => {
    if (currentStep === TOTAL_TOUR_STEPS - 1) endTour();
    else setCurrentStep(currentStep + 1);
  };
  const handleTourPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // The exam starts as soon as the page opens; "retake" remounts the page
  useEffect(() => {
    if (pageType !== "exam") return;
    quizHeaderRef.current?.startExam();
    Toast.show({ type: "success", text1: "Exam started! Good luck!", position: "top", visibilityTime: 1000 });
  }, []);

  const resetDialog = (
    <ResetTestDialog
      key={`reset-${state.resetCount}`}
      isOpen={isResetDialogOpen}
      onClose={() => setIsResetDialogOpen(false)}
      onConfirm={actions.retake}
      testTitle={quiz.title}
    />
  );

  if (results) {
    return (
      <View style={{ flex: 1 }}>
        {resetDialog}
        <ResultsModal
          results={results as any}
          pageType={pageType as any}
          backUrl={backUrl}
          nextTopicUrl={nextTopicUrl}
          setIsResetDialogOpen={setIsResetDialogOpen}
          handleRetakeQuiz={actions.retake}
          handleBack={actions.leave}
          showResults
          setShowResults={(show) => !show && actions.closeResults()}
          isDark={isDark}
        />
      </View>
    );
  }

  const currentQuestion = questions[index];
  const isAnswered = currentQuestion.id in answered;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      {resetDialog}
      <AllTasksDialog
        isOpen={isAllTasksDialogOpen}
        onClose={() => setIsAllTasksDialogOpen(false)}
        questions={questions}
        answeredQuestions={answered}
        currentQuestionIndex={index}
        onQuestionSelect={actions.goToQuestion}
      />
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 6 }}>
        <QuizHeader
          quizTitle={quiz.title}
          currentQuestionIndex={index}
          questions={questions}
          answeredQuestions={answered}
          pageType={pageType}
          currentIconColor={currentIconColor}
          maxFreeIndex={questions.length - 1}
          toggleResetDialog={() => setIsResetDialogOpen(true)}
          toggleAllTasksDialog={() => setIsAllTasksDialogOpen(true)}
          setCurrentQuestionIndex={actions.goToQuestion}
          setIsProModalOpen={(open) => open && actions.openPaywall()}
          handleBack={actions.leave}
          submitQuizResults={actions.finish}
          ref={quizHeaderRef}
          tourActive={tourActive}
          currentStep={currentStep}
          handleTourNext={handleTourNext}
          handleTourPrev={handleTourPrev}
          skipTour={skipTour}
          isNumbersQuiz={quiz.id === numbersQuizId}
        />
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: "100%", maxWidth: 760, alignSelf: "center" }}>
          {/* Topic + hint / save */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <Tag label={quiz.title?.trim() || "Quiz"} tone="lav" style={{ maxWidth: "100%" }} />
            </View>
            <QuestionToggles
              currentQuestion={currentQuestion}
              currentQuestionIndex={index}
              currentIconColor={currentIconColor}
              token={token}
              chapterId={quiz.chapterId}
              quizId={quiz.id}
              setQuestions={actions.setQuestions}
              onHintPress={() => setIsHintModalOpen(true)}
            />
          </View>

          {/* Question */}
          <View style={{ marginHorizontal: -12, marginTop: 6 }}>
            <AutoHeightWebView
              source={{ html: wrapHtmlContent(currentQuestion.question || "", { isDark, variant: "question" }) }}
              style={{ width: "100%", minHeight: 10 }}
              scrollEnabled={false}
            />
          </View>
          {currentQuestion.questionImageUrl && (
            <QuestionImage uri={currentQuestion.questionImageUrl} height={currentQuestion.imageHeight * 1.2} />
          )}

          <View style={{ marginTop: 14 }}>
            <QuestionOptions
              currentQuestion={currentQuestion}
              selectedAnswers={selected}
              isAnswered={isAnswered}
              pageType={pageType}
              handleAnswerSelect={actions.selectOption}
            />
          </View>

          {/* Explanation (hidden during the exam) */}
          {isAnswered && pageType !== "exam" && currentQuestion.explanation && (
            <View style={{ marginTop: 18 }}>
              {/* little tail pointing up at the answers */}
              <View style={{ position: "absolute", left: 40, top: -7, width: 18, height: 18, backgroundColor: c.butter, transform: [{ rotate: "45deg" }], borderRadius: 4 }} />
              <View style={{ backgroundColor: c.butter, borderRadius: 24, paddingTop: 14, paddingBottom: 4, overflow: "hidden" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16 }}>
                  <Lightbulb size={18} color={c.onPastel} strokeWidth={2.1} />
                  <T variant="h3" onPastel>
                    Explanation
                  </T>
                </View>
                <View style={{ paddingHorizontal: 4 }}>
                  <AutoHeightWebView
                    source={{ html: wrapHtmlContent(currentQuestion.explanation, { isDark: false }) }}
                    style={{ width: "100%", minHeight: 10 }}
                    scrollEnabled={false}
                  />
                </View>
                {currentQuestion.hintImageUrl && (
                  <View style={{ marginBottom: 12, paddingHorizontal: 12 }}>
                    <QuestionImage uri={currentQuestion.hintImageUrl} height={currentQuestion.imageHeight * 1.2} />
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <QuestionBottomNav
        pageType={pageType}
        currentQuestionIndex={index}
        questions={questions}
        isCompleted={state.reviewOnly}
        selectedAnswers={selected}
        answeredQuestions={answered}
        enableFinishSaved={state.finishSavedArmed}
        isSubmitting={isSubmitting}
        currentIconColor={currentIconColor}
        previousQuestion={actions.previousQuestion}
        handleNextQuestion={actions.pressNext}
        finishReview={() => actions.leave()}
      />

      <HintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        hint={currentQuestion.hint}
        hintImageUrl={currentQuestion.hintImageUrl}
      />
    </SafeAreaView>
  );
}
