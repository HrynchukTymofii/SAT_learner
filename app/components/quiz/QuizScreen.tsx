import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AutoHeightWebView from "react-native-autoheight-webview";
import { useColorScheme } from "@/hooks/useColorScheme";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const currentIconColor = isDark ? "#F4F1F8" : "#0B0A0F";

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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9" }}
      edges={["top", "bottom"]}
    >
      {resetDialog}
      <AllTasksDialog
        isOpen={isAllTasksDialogOpen}
        onClose={() => setIsAllTasksDialogOpen(false)}
        questions={questions}
        answeredQuestions={answered}
        currentQuestionIndex={index}
        onQuestionSelect={actions.goToQuestion}
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingHorizontal: 4,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingVertical: 8, width: "100%", maxWidth: 800 }}>
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

          {/* Question Counter */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 12,
              marginTop: 12,
            }}
          >
            <View
              style={{
                backgroundColor: isDark ? "#17151C" : "#ffffff",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                borderLeftWidth: 2,
                borderLeftColor: "#8A5CE6",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: isDark ? "#F4F1F8" : "#0B0A0F" }}>
                Question {index + 1} of {questions.length}
              </Text>
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

          <AutoHeightWebView
            source={{ html: wrapHtmlContent(currentQuestion.question || "", { isDark }) }}
            style={{ width: "100%", minHeight: 10 }}
            scrollEnabled={false}
          />
          {currentQuestion.questionImageUrl && (
            <QuestionImage
              uri={currentQuestion.questionImageUrl}
              height={currentQuestion.imageHeight * 1.2}
            />
          )}

          <QuestionOptions
            currentQuestion={currentQuestion}
            selectedAnswers={selected}
            isAnswered={isAnswered}
            pageType={pageType}
            handleAnswerSelect={actions.selectOption}
          />

          {/* Explanation (hidden during the exam) */}
          {isAnswered && pageType !== "exam" && currentQuestion.explanation && (
            <>
              <View
                style={{
                  backgroundColor: isDark ? "#17151C" : "#ffffff",
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                  marginTop: 32,
                  marginHorizontal: 8,
                  alignSelf: "flex-start",
                  borderLeftWidth: 2,
                  borderLeftColor: "#8A5CE6",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "700", color: isDark ? "#F4F1F8" : "#0B0A0F" }}>
                  💡 Explanation
                </Text>
              </View>
              <AutoHeightWebView
                source={{ html: wrapHtmlContent(currentQuestion.explanation, { isDark }) }}
                style={{ width: "100%", minHeight: 10 }}
                scrollEnabled={false}
              />
              {currentQuestion.hintImageUrl && (
                <View style={{ marginBottom: 16 }}>
                  <QuestionImage
                    uri={currentQuestion.hintImageUrl}
                    height={currentQuestion.imageHeight * 1.2}
                  />
                </View>
              )}
            </>
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
