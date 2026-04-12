from __future__ import annotations

from typing import TYPE_CHECKING, Self, Sequence

from sqlalchemy import and_, func, or_, select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import InstrumentedAttribute
from sqlalchemy.sql.elements import ColumnElement

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

type FilterDict = dict[str, object]
type OrderByClause = list[ColumnElement[object] | InstrumentedAttribute[object]]


class CRUDMixin:
    @classmethod
    async def create(cls, session: AsyncSession, **kwargs: object) -> Self:
        obj = cls(**kwargs)
        session.add(obj)
        await session.commit()
        await session.refresh(obj)
        return obj

    @classmethod
    async def get_or_create(
        cls,
        session: AsyncSession,
        defaults: FilterDict | None = None,
        **kwargs: object,
    ) -> tuple[Self, bool]:
        """Return ``(instance, created)``.

        *created* is True if a new row was inserted.
        """
        if obj := await cls.filter_one(session, **kwargs):
            return obj, False
        create_kwargs = {**(defaults or {}), **kwargs}
        return await cls.create(session, **create_kwargs), True

    @classmethod
    async def get(cls, session: AsyncSession, pk: object) -> Self | None:
        return await session.get(cls, pk)

    @classmethod
    async def get_or_raise(cls, session: AsyncSession, pk: object) -> Self:
        """Like ``get`` but raises ``NoResultFound`` instead of returning None."""
        if obj := await session.get(cls, pk):
            return obj
        raise NoResultFound(f"{cls.__name__} with pk={pk!r} not found")

    @classmethod
    async def filter_one(cls, session: AsyncSession, **kwargs: object) -> Self | None:
        """Return the first row matching all keyword filters, or None."""
        stmt = select(cls).filter_by(**kwargs).limit(1)
        result = await session.execute(stmt)
        return result.scalars().first()

    @classmethod
    async def list(
        cls,
        session: AsyncSession,
        limit: int | None = None,
        offset: int | None = None,
        order_by: OrderByClause | None = None,
    ) -> Sequence[Self]:
        stmt = select(cls)
        if order_by:
            stmt = stmt.order_by(*order_by)
        if limit is not None:
            stmt = stmt.limit(limit)
        if offset is not None:
            stmt = stmt.offset(offset)
        result = await session.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def filter(
        cls,
        session: AsyncSession,
        *,
        filters: FilterDict | None = None,
        or_filters: FilterDict | None = None,
        limit: int | None = None,
        offset: int | None = None,
        order_by: OrderByClause | None = None,
    ) -> Sequence[Self]:
        """Flexible filter method.

        ``filters``    - AND conditions, e.g. ``{"status": "active"}``
        ``or_filters`` - OR conditions across the same set of keys/values.

        Both can be combined: rows must satisfy AND-conditions AND at
        least one of the OR-conditions.
        """
        stmt = select(cls)

        and_clauses = [
            getattr(cls, key) == value for key, value in (filters or {}).items()
        ]
        or_clauses = [
            getattr(cls, key) == value for key, value in (or_filters or {}).items()
        ]

        if and_clauses and or_clauses:
            stmt = stmt.where(and_(*and_clauses, or_(*or_clauses)))
        elif and_clauses:
            stmt = stmt.where(and_(*and_clauses))
        elif or_clauses:
            stmt = stmt.where(or_(*or_clauses))

        if order_by:
            stmt = stmt.order_by(*order_by)
        if limit is not None:
            stmt = stmt.limit(limit)
        if offset is not None:
            stmt = stmt.offset(offset)

        result = await session.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def search(
        cls,
        session: AsyncSession,
        column: str,
        query: str,
        *,
        case_sensitive: bool = False,
        limit: int | None = None,
        offset: int | None = None,
    ) -> Sequence[Self]:
        """LIKE / ILIKE search on a single text column."""
        col: InstrumentedAttribute[object] = getattr(cls, column)
        pattern = f"%{query}%"
        condition = col.like(pattern) if case_sensitive else col.ilike(pattern)
        stmt = select(cls).where(condition)
        if limit is not None:
            stmt = stmt.limit(limit)
        if offset is not None:
            stmt = stmt.offset(offset)
        result = await session.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def update(
        cls, session: AsyncSession, pk: object, **kwargs: object
    ) -> Self | None:
        if not (obj := await session.get(cls, pk)):
            return None
        for key, value in kwargs.items():
            setattr(obj, key, value)
        session.add(obj)
        await session.commit()
        await session.refresh(obj)
        return obj

    @classmethod
    async def update_or_raise(
        cls, session: AsyncSession, pk: object, **kwargs: object
    ) -> Self:
        if not (obj := await cls.update(session, pk, **kwargs)):
            raise NoResultFound(f"{cls.__name__} with pk={pk!r} not found")
        return obj

    @classmethod
    async def upsert(cls, session: AsyncSession, **kwargs: object) -> Self:
        """Merge by PK - updates if exists, inserts if not."""
        obj = cls(**kwargs)
        merged = await session.merge(obj)
        await session.commit()
        await session.refresh(merged)
        return merged

    @classmethod
    async def delete(cls, session: AsyncSession, pk: object) -> bool:
        if not (obj := await session.get(cls, pk)):
            return False
        await session.delete(obj)
        await session.commit()
        return True

    @classmethod
    async def delete_or_raise(cls, session: AsyncSession, pk: object) -> None:
        if not await cls.delete(session, pk):
            raise NoResultFound(f"{cls.__name__} with pk={pk!r} not found")

    @classmethod
    async def bulk_delete(cls, session: AsyncSession, **filters: object) -> int:
        """Delete all rows matching *filters*, return the number deleted."""
        objs = await cls.filter(session, filters=filters)
        for obj in objs:
            await session.delete(obj)
        await session.commit()
        return len(objs)

    @classmethod
    async def count(cls, session: AsyncSession, **filters: object) -> int:
        """Return row count, optionally narrowed by keyword filters."""
        stmt = select(func.count()).select_from(cls)
        if filters:
            clauses = [getattr(cls, k) == v for k, v in filters.items()]
            stmt = stmt.where(and_(*clauses))
        result = await session.execute(stmt)
        return result.scalar_one()

    @classmethod
    async def exists(cls, session: AsyncSession, **kwargs: object) -> bool:
        """Return True if at least one row matches all keyword filters."""
        return await cls.count(session, **kwargs) > 0
