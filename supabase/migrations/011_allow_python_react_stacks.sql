-- Allow the 'python' and 'react' code stacks on generated challenges.
-- These are offered in the profile stack picker and handled by the challenge
-- generator (stackMap + noTestsNote), but 008's check constraint only accepted
-- 'javascript', 'typescript' and 'design' — so generating a Python/React
-- challenge failed with challenges_stack_check.

alter table public.challenges drop constraint if exists challenges_stack_check;
alter table public.challenges
  add constraint challenges_stack_check
  check (stack in ('javascript', 'typescript', 'python', 'react', 'design'));
