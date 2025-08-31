use thiserror::Error;

#[derive(Error, Debug)]
pub enum CheckerError {
  #[error("io error: {0}")]
  IoError(#[from] std::io::Error),
  #[error("missing checker script: {0}")]
  MissingCheckerScript(String),
  #[error("rune context error: {0}")]
  RuneError(#[from] rune::ContextError),
  #[error("rune runtime error: {0}")]
  RuneRuntimeError(#[from] rune::runtime::RuntimeError),
  #[error("can not load script source: {0}")]
  SourceError(#[from] rune::source::FromPathError),
  #[error("can not build script unit: {0}")]
  BuildError(#[from] rune::BuildError),
  #[error("can not alloc script engine runtime: {0}")]
  AllocError(#[from] rune::alloc::Error),
  #[error("executed script error: {0}")]
  ExecError(#[from] rune::runtime::VmError),
  #[error("missing fields from script result: {0}")]
  MissingResultField(String),
  #[error("script error: {0}")]
  ScriptError(String),
  #[error("compile error: {0}")]
  CompileError(String),
  #[error("missing function: {0}")]
  MissingFunction(String),
  #[error("failed to emit diagnostics: {0}")]
  DiagnosticsError(#[from] rune::diagnostics::EmitError),
  #[error("string UTF-8 decode error: {0}")]
  FromUtf8Error(#[from] std::string::FromUtf8Error),
}
