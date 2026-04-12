import fastapi_utils.tasks

TWENTY_FOUR_HOURS_IN_SECONDS = 60 * 60 * 24


async def task_definition() -> ...: ...


@fastapi_utils.tasks.repeat_every(seconds=TWENTY_FOUR_HOURS_IN_SECONDS)
async def task() -> None:
    await task_definition()
