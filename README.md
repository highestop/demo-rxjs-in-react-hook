# demo-rxjs-in-react-hook

因为 React Render 的机制，在 React 中使用 RxJS 的核心在于控制 Observable 引用的变化，即不能每次 render 都产生新的 Observable，否则订阅会变得不可追踪。

思路是简单地控制"单例"，方式有两种：

- 第一种是利用 `useRef` 或 `useMemo` 在 Hook 中创建若干 Observable，注意这些 Observable 派生的 Observable 也要控制引用。参考 `src/react.tsx`。
- 第二种是利用 Class 在 React 之外来管理 Observable 及相关逻辑，然后在 Hook 中用 `useRef` 创建这个 Class 的单例，便可订阅 Class 暴露出来的 public Observable。参考 `src/rxjs.tsx`。

这里我个人推荐后者，因为它有个架构上的优势，即所有用到 RxJS 维护的逻辑完全与 React 框架分离。一个复杂的业务模块得以进行独立的单元测试，也可以轻松地替换上层的 Render 框架。

在这样的写法中，React 与 RxJS 的胶水层非常薄，只由一层 Hook 负责将 Observable 订阅成 State，比如用 `observable-hook` 中提供的 `useSubscription` 或 `useObservableState`。如果希望利用 Context 来提供这些 State（ 因为创建的是 Class 的单例，所以这些 State 应该在一个 Scope 下统一维护 ），可以借助 `constate` 的能力。

最终形成一套 Service(RxJS) > Context(Constate) > Hook(ObservableHooks) > Component(ReactFunctionComponent) 的架构。
